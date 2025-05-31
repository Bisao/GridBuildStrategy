import { useState, useEffect, useRef } from 'react';
import *THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameState } from '../lib/stores/useGameState';

export const useNPCControl = () => {
  const { controlledNPCId, updateNPC, createdNPCs } = useGameState();
  const { camera, gl } = useThree();
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const [isMovingToTarget, setIsMovingToTarget] = useState(false);
  const lastUpdateTime = useRef(Date.now());
  const raycaster = useRef(new THREE.Raycaster());

  // Handle mouse clicks for movement (Albion style)
  useEffect(() => {
    if (!controlledNPCId) return;

    const handleMouseClick = (event: MouseEvent) => {
      // Right click to move
      if (event.button === 2) {
        event.preventDefault();

        // Calculate mouse position in normalized device coordinates
        const rect = gl.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1
        );

        // Cast ray to find ground intersection
        raycaster.current.setFromCamera(mouse, camera);
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectionPoint = new THREE.Vector3();

        if (raycaster.current.ray.intersectPlane(groundPlane, intersectionPoint)) {
          setTargetPosition(intersectionPoint.clone());
          setIsMovingToTarget(true);
        }
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault(); // Prevent context menu
    };

    gl.domElement.addEventListener('mousedown', handleMouseClick);
    gl.domElement.addEventListener('contextmenu', handleContextMenu);

    return () => {
      gl.domElement.removeEventListener('mousedown', handleMouseClick);
      gl.domElement.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [controlledNPCId, camera, gl]);

  // Update NPC movement and rotation
  useFrame(() => {
    if (!controlledNPCId) return;

    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime.current) / 1000;
    lastUpdateTime.current = currentTime;

    const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
    if (!controlledNPC) return;

    const currentPos = new THREE.Vector3(controlledNPC.position.x, 0, controlledNPC.position.z);
    const speed = 3.0;
    let newPosition = { x: controlledNPC.position.x, z: controlledNPC.position.z };
    let rotationY = controlledNPC.rotation || 0;
    let animation = 'idle';

    // Handle movement to target position (Albion style)
    if (isMovingToTarget && targetPosition) {
      const direction = targetPosition.clone().sub(currentPos);
      const distance = direction.length();

      if (distance > 0.1) {
        // Calculate rotation to face movement direction
        direction.normalize();
        rotationY = Math.atan2(direction.x, direction.z);

        // Move towards target
        const movement = direction.multiplyScalar(speed * deltaTime);
        newPosition.x += movement.x;
        newPosition.z += movement.z;
        animation = 'walk';
      } else {
        // Reached target
        setIsMovingToTarget(false);
        setTargetPosition(null);
        animation = 'idle';
      }
    }

    // Update NPC
    updateNPC(controlledNPCId, {
      position: newPosition,
      animation,
      rotation: rotationY
    });

    // Update camera to follow NPC (Albion style isometric)
    const isometricOffset = new THREE.Vector3(-10, 15, -10);
    const targetCameraPosition = new THREE.Vector3(newPosition.x, 0, newPosition.z).add(isometricOffset);
    const lookAtPosition = new THREE.Vector3(newPosition.x, 0, newPosition.z);

    camera.position.lerp(targetCameraPosition, 0.08);
    camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
  });

  return {
    isControlling: !!controlledNPCId,
    controlledNPCId,
    isMovingToTarget,
    targetPosition
  };
};