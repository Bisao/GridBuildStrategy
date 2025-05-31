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
      // Calculate normalized screen position (-1 to 1)
      const rect = document.body.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const normalizedX = (event.clientX - centerX) / centerX;
      const normalizedY = -(event.clientY - centerY) / centerY; // Inverted Y for correct direction

      setScreenMousePosition(new THREE.Vector2(normalizedX, normalizedY));

      // Calculate rotation based on mouse position
      const angle = Math.atan2(normalizedX, normalizedY);
      setMousePosition(new THREE.Vector2(angle, 0));
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

    const speed = 2.5;
    let movement = new THREE.Vector3();
    let isMoving = false;

    // Calculate movement based on cursor position and distance from center
    const cursorDistance = Math.sqrt(screenMousePosition.x * screenMousePosition.x + screenMousePosition.y * screenMousePosition.y);
    const movementIntensity = Math.min(cursorDistance * 1.5, 1.0); // Scale movement intensity based on cursor distance from center

    // Only move if cursor is sufficiently far from center (dead zone)
    const deadZone = 0.1;
    if (cursorDistance > deadZone) {
      // Calculate movement direction based on cursor position
      const moveX = screenMousePosition.x * movementIntensity * speed * deltaTime;
      const moveZ = screenMousePosition.y * movementIntensity * speed * deltaTime;

      movement.add(new THREE.Vector3(moveX, 0, moveZ));
      isMoving = true;
    }

    // Alternative: WASD keys can still be used for manual control
    const rotationY = mousePosition.x;
    const forward = new THREE.Vector3(Math.sin(rotationY), 0, Math.cos(rotationY));
    const right = new THREE.Vector3(Math.cos(rotationY), 0, -Math.sin(rotationY));

    if (keys.w) {
      movement.add(forward.clone().multiplyScalar(speed * deltaTime * 0.5));
      isMoving = true;
    }
    if (keys.s) {
      movement.add(forward.clone().multiplyScalar(-speed * deltaTime * 0.5));
      isMoving = true;
    }
    if (keys.a) {
      movement.add(right.clone().multiplyScalar(speed * deltaTime * 0.5));
      isMoving = true;
    }
    if (keys.d) {
      movement.add(right.clone().multiplyScalar(-speed * deltaTime * 0.5));
      isMoving = true;
    }

    // Update NPC position and animation
    if (movement.length() > 0 || mousePosition.x !== 0) {
      const newPosition = {
        x: controlledNPC.position.x + movement.x,
        z: controlledNPC.position.z + movement.z
      };

      updateNPC(controlledNPCId, {
        position: newPosition,
        animation: isMoving ? 'walk' : 'idle',
        rotation: rotationY
      });

      // Update camera to follow controlled NPC from behind and above
      const npcDirection = new THREE.Vector3(Math.sin(rotationY), 0, Math.cos(rotationY));
      const cameraOffset = npcDirection.clone().multiplyScalar(-4).add(new THREE.Vector3(0, 3, 0));
      const targetPosition = new THREE.Vector3(newPosition.x, 0, newPosition.z).add(cameraOffset);
      const lookAtPosition = new THREE.Vector3(newPosition.x, 1, newPosition.z).add(npcDirection.clone().multiplyScalar(2));

      camera.position.lerp(targetPosition, 0.1);
      camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
    }
  });

  return {
    isControlling: !!controlledNPCId,
    controlledNPCId
  };
};