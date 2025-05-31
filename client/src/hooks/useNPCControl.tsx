
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameState } from '../lib/stores/useGameState';

export const useNPCControl = () => {
  const { controlledNPCId, updateNPC, createdNPCs } = useGameState();
  const { camera } = useThree();
  const [keys, setKeys] = useState({
    w: false,
    a: false,
    s: false,
    d: false
  });
  const [mousePosition, setMousePosition] = useState(new THREE.Vector2());
  const lastUpdateTime = useRef(Date.now());

  // Handle keyboard input
  useEffect(() => {
    if (!controlledNPCId) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: true }));
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['w', 'a', 's', 'd'].includes(key)) {
        setKeys(prev => ({ ...prev, [key]: false }));
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [controlledNPCId]);

  // Handle mouse movement for NPC rotation
  useEffect(() => {
    if (!controlledNPCId) return;

    const handleMouseMove = (event: MouseEvent) => {
      const sensitivity = 0.003; // Increased sensitivity for more responsive controls
      const deltaX = event.movementX * sensitivity;
      setMousePosition(prev => new THREE.Vector2(prev.x - deltaX, prev.y)); // Inverted deltaX for correct rotation
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [controlledNPCId]);

  // Update NPC position and rotation
  useFrame(() => {
    if (!controlledNPCId) return;

    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime.current) / 1000;
    lastUpdateTime.current = currentTime;

    const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
    if (!controlledNPC) return;

    const speed = 2; // units per second
    let movement = new THREE.Vector3();
    let isMoving = false;

    // Calculate movement direction based on mouse rotation
    const rotationY = mousePosition.x;
    const forward = new THREE.Vector3(Math.sin(rotationY), 0, Math.cos(rotationY));
    const right = new THREE.Vector3(Math.cos(rotationY), 0, -Math.sin(rotationY));

    if (keys.w) {
      movement.add(forward.clone().multiplyScalar(speed * deltaTime));
      isMoving = true;
    }
    if (keys.s) {
      movement.add(forward.clone().multiplyScalar(-speed * deltaTime));
      isMoving = true;
    }
    if (keys.a) {
      movement.add(right.clone().multiplyScalar(speed * deltaTime));
      isMoving = true;
    }
    if (keys.d) {
      movement.add(right.clone().multiplyScalar(-speed * deltaTime));
      isMoving = true;
    }

    // Always update NPC rotation, and position only when moving
    const newPosition = {
      x: controlledNPC.position.x + movement.x,
      z: controlledNPC.position.z + movement.z
    };

    // Update NPC state
    updateNPC(controlledNPCId, {
      position: newPosition,
      animation: isMoving ? 'walk' : 'idle',
      rotation: rotationY
    });

    // Always update camera for better responsiveness, even when just rotating
    if (movement.length() > 0 || mousePosition.x !== 0 || true) {

      // Update camera to follow controlled NPC from behind and above with improved responsiveness
      const npcDirection = new THREE.Vector3(Math.sin(rotationY), 0, Math.cos(rotationY));
      const cameraOffset = npcDirection.clone().multiplyScalar(-3.5).add(new THREE.Vector3(0, 2.5, 0));
      const targetPosition = new THREE.Vector3(newPosition.x, 0, newPosition.z).add(cameraOffset);
      const lookAtPosition = new THREE.Vector3(newPosition.x, 1.2, newPosition.z).add(npcDirection.clone().multiplyScalar(1.5));
      
      // More responsive camera movement with different lerp speeds for position and rotation
      const positionLerpSpeed = isMoving ? 0.15 : 0.12;
      const rotationLerpSpeed = 0.08;
      
      camera.position.lerp(targetPosition, positionLerpSpeed);
      
      // Smooth camera rotation using quaternions for better interpolation
      const currentLookAt = new THREE.Vector3();
      camera.getWorldDirection(currentLookAt);
      currentLookAt.add(camera.position);
      
      const targetLookDirection = lookAtPosition.clone().sub(camera.position).normalize();
      const currentLookDirection = currentLookAt.clone().sub(camera.position).normalize();
      
      const lerpedDirection = currentLookDirection.lerp(targetLookDirection, rotationLerpSpeed);
      const finalLookAt = camera.position.clone().add(lerpedDirection);
      
      camera.lookAt(finalLookAt.x, finalLookAt.y, finalLookAt.z);
    }
  });

  return {
    isControlling: !!controlledNPCId,
    controlledNPCId
  };
};
