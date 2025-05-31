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
  const [screenMousePosition, setScreenMousePosition] = useState(new THREE.Vector2());
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

  // Handle mouse movement for NPC direction control
  useEffect(() => {
    if (!controlledNPCId) return;

    const handleMouseMove = (event: MouseEvent) => {
      // Get mouse position relative to window
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      // Store mouse position for calculating NPC rotation
      setScreenMousePosition(new THREE.Vector2(mouseX, mouseY));
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [controlledNPCId]);

  // Update NPC position and rotation
  useFrame(({ camera, size }) => {
    if (!controlledNPCId) return;

    const currentTime = Date.now();
    const deltaTime = (currentTime - lastUpdateTime.current) / 1000;
    lastUpdateTime.current = currentTime;

    const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
    if (!controlledNPC) return;

    const speed = 2.5;
    let movement = new THREE.Vector3();
    let isMoving = false;

    // Calculate cursor world position for NPC to look at
    const mouse = new THREE.Vector2(
      (screenMousePosition.x / size.width) * 2 - 1,
      -(screenMousePosition.y / size.height) * 2 + 1
    );

    // Create raycaster to get 3D position from mouse coordinates
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // Cast ray onto ground plane (y = 0)
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const cursorWorldPos = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, cursorWorldPos);

    // Calculate rotation for NPC to look at cursor position
    const npcPos = new THREE.Vector3(controlledNPC.position.x, 0, controlledNPC.position.z);
    const lookDirection = cursorWorldPos.clone().sub(npcPos).normalize();
    const rotationY = Math.atan2(lookDirection.x, lookDirection.z);

    // Project Zomboid style movement - absolute directions
    // W = North (positive Z), S = South (negative Z)
    // A = West (negative X), D = East (positive X)
    if (keys.w) {
      movement.z += speed * deltaTime; // Move north
      isMoving = true;
    }
    if (keys.s) {
      movement.z -= speed * deltaTime; // Move south
      isMoving = true;
    }
    if (keys.a) {
      movement.x -= speed * deltaTime; // Move west
      isMoving = true;
    }
    if (keys.d) {
      movement.x += speed * deltaTime; // Move east
      isMoving = true;
    }

    // Update NPC position and animation
    const newPosition = {
      x: controlledNPC.position.x + movement.x,
      z: controlledNPC.position.z + movement.z
    };

    // Always update NPC to look at cursor position
    updateNPC(controlledNPCId, {
      position: newPosition,
      animation: isMoving ? 'walk' : 'idle',
      rotation: rotationY
    });

      // Update camera to isometric view - fixed position above and behind NPC
    const isometricOffset = new THREE.Vector3(-8, 12, -8); // Fixed isometric angle
    const targetPosition = new THREE.Vector3(newPosition.x, 0, newPosition.z).add(isometricOffset);
    const lookAtPosition = new THREE.Vector3(newPosition.x, 0, newPosition.z);

    camera.position.lerp(targetPosition, 0.1);
    camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
  });

  return {
    isControlling: !!controlledNPCId,
    controlledNPCId
  };
};