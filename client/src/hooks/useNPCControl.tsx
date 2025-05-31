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
  useFrame(() => {
    if (!controlledNPCId) return;

    const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
    if (!controlledNPC) return;

    const currentTime = Date.now();
    const deltaTime = Math.min((currentTime - lastUpdateTime.current) / 1000, 0.016);
    lastUpdateTime.current = currentTime;

    const speed = 3;
    let newPosition = { ...controlledNPC.position };
    let newRotation = controlledNPC.rotation || 0;
    let animation = "idle";

    // Calculate cursor world position for look direction
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mousePosition, camera);

    // Create a plane at ground level (y = 0) for intersection
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const cursorWorldPos = new THREE.Vector3();
    raycaster.ray.intersectPlane(groundPlane, cursorWorldPos);

    // Calculate NPC position and look direction
    const npcPos = new THREE.Vector3(controlledNPC.position.x, 0, controlledNPC.position.z);
    const lookDirection = cursorWorldPos.clone().sub(npcPos).normalize();
    const rotationY = Math.atan2(lookDirection.x, lookDirection.z);

    // Movement controls
    if (keys.w) {
      // Move towards cursor direction
      newPosition.x += lookDirection.x * speed * deltaTime;
      newPosition.z += lookDirection.z * speed * deltaTime;
      newRotation = rotationY;
      animation = "walking";
    }

    if (keys.s) {
      // Move away from cursor
      newPosition.x -= lookDirection.x * speed * deltaTime;
      newPosition.z -= lookDirection.z * speed * deltaTime;
      newRotation = rotationY + Math.PI;
      animation = "walking";
    }

    if (keys.a) {
      // Strafe left
      const leftDirection = new THREE.Vector3(-lookDirection.z, 0, lookDirection.x);
      newPosition.x += leftDirection.x * speed * deltaTime;
      newPosition.z += leftDirection.z * speed * deltaTime;
      newRotation = Math.atan2(leftDirection.x, leftDirection.z);
      animation = "walking";
    }

    if (keys.d) {
      // Strafe right
      const rightDirection = new THREE.Vector3(lookDirection.z, 0, -lookDirection.x);
      newPosition.x += rightDirection.x * speed * deltaTime;
      newPosition.z += rightDirection.z * speed * deltaTime;
      newRotation = Math.atan2(rightDirection.x, rightDirection.z);
      animation = "walking";
    }

    // Always look towards cursor when not moving
    if (!keys.w && !keys.s && !keys.a && !keys.d) {
      newRotation = rotationY;
    }

    // Update NPC position and rotation
    updateNPC(controlledNPCId, {
      position: newPosition,
      rotation: newRotation,
      animation
    });

    // Update camera to isometric view - fixed position above and behind NPC
    const isometricOffset = new THREE.Vector3(-8, 12, -8);
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
import { useRef } from 'react';
import { useThree } from '@react-three/fiber';

export const useClickControl = () => {
  const { camera } = useThree();
  const mouse = useRef(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  const [clickPosition, setClickPosition] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!controlledNPCId || !raycaster.current || !camera) return;

      const rect = (event.target as Element)?.getBoundingClientRect();
      if (!rect) return;

      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);

      const gridPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();

      if (raycaster.current.ray.intersectPlane(gridPlane, intersectionPoint)) {
        // Check if there's an active skill to execute
        const executeActiveSkill = (window as any).executeActiveSkill;
        if (executeActiveSkill) {
          executeActiveSkill(intersectionPoint);
        } else {
          // Default movement
          setClickPosition(intersectionPoint.clone());
        }
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Cancel active skill
        const setActiveSkill = (window as any).setActiveSkill;
        if (setActiveSkill) {
          setActiveSkill(null);
        }
      }
    };

    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', handleClick);
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        canvas.removeEventListener('click', handleClick);
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [controlledNPCId, camera]);

  return { clickPosition };
};