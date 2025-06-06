import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGameState } from '../lib/stores/useGameState';

export const useNPCControl = () => {
  const { controlledNPCId, updateNPC, createdNPCs } = useGameState();
  const { camera } = useThree();
  const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);
  const [mousePosition, setMousePosition] = useState(new THREE.Vector2());
  const [selectedEnemyId, setSelectedEnemyId] = useState<string | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const lastUpdateTime = useRef(Date.now());

  // Handle mouse movement for NPC rotation
  useEffect(() => {
    if (!controlledNPCId) return;

    const handleMouseMove = (event: MouseEvent) => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      setMousePosition(new THREE.Vector2(x, y));
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [controlledNPCId]);

  // Handle click for movement
  useEffect(() => {
    if (!controlledNPCId) return;

    const handleClick = (event: MouseEvent) => {
      if (!canvas || !camera || !controlledNPCId) return;

      const rect = canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const mouse = new THREE.Vector2(x, y);
      raycaster.current.setFromCamera(mouse, camera);

      // First check if clicking on an enemy
      const enemies = (window as any).enemies || [];
      let clickedEnemy = null;

      for (const enemy of enemies) {
        // Create a simple bounding box for enemy detection
        const enemyBox = new THREE.Box3(
          new THREE.Vector3(enemy.position.x - 0.5, 0, enemy.position.z - 0.5),
          new THREE.Vector3(enemy.position.x + 0.5, 2, enemy.position.z + 0.5)
        );

        const ray = raycaster.current.ray;
        if (ray.intersectsBox(enemyBox)) {
          clickedEnemy = enemy;
          break;
        }
      }

      if (clickedEnemy) {
        // Clear previous selection
        if (selectedEnemyId) {
          const prevSetSelected = (window as any)[`enemy_${selectedEnemyId}_setSelected`];
          if (prevSetSelected) prevSetSelected(false);
        }
        
        // Set new selection
        setSelectedEnemyId(clickedEnemy.id);
        const setSelected = (window as any)[`enemy_${clickedEnemy.id}_setSelected`];
        if (setSelected) setSelected(true);
        
        // Execute attack skill on enemy
        const executeSkillOnEnemy = (window as any).executeSkillOnEnemy;
        if (executeSkillOnEnemy) {
          executeSkillOnEnemy(clickedEnemy.id);
        }
      } else {
        // Check intersection with ground plane for movement
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectionPoint = new THREE.Vector3();

        if (raycaster.current.ray.intersectPlane(groundPlane, intersectionPoint)) {
          setTargetPosition(intersectionPoint.clone());
        }
      }
    };

    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    canvas.addEventListener('click', handleClick);
    return () => canvas.removeEventListener('click', handleClick);
  }, [controlledNPCId, camera]);

  // Handle ESC key to stop movement
  useEffect(() => {
    if (!controlledNPCId) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setTargetPosition(null);
        
        // Clear enemy selection
        if (selectedEnemyId) {
          const setSelected = (window as any)[`enemy_${selectedEnemyId}_setSelected`];
          if (setSelected) setSelected(false);
          setSelectedEnemyId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [controlledNPCId]);

  // Update NPC position and rotation
  useFrame(() => {
    if (!controlledNPCId) return;

    const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
    if (!controlledNPC) return;
    
    // Stop control if NPC is dead
    if (controlledNPC.health <= 0) {
      // Clear target position and enemy selection when NPC dies
      setTargetPosition(null);
      if (selectedEnemyId) {
        const setSelected = (window as any)[`enemy_${selectedEnemyId}_setSelected`];
        if (setSelected) setSelected(false);
        setSelectedEnemyId(null);
      }
      return;
    }

    const currentTime = Date.now();
    const deltaTime = Math.min((currentTime - lastUpdateTime.current) / 1000, 0.016);
    lastUpdateTime.current = currentTime;

    let newPosition = { ...controlledNPC.position };
    let newRotation = controlledNPC.rotation || 0;
    let animation = "idle";

    // Calculate mouse world position for look direction
    raycaster.current.setFromCamera(mousePosition, camera);
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const cursorWorldPos = new THREE.Vector3();
    raycaster.current.ray.intersectPlane(groundPlane, cursorWorldPos);

    // Calculate look direction based on mouse position
    const npcPos = new THREE.Vector3(controlledNPC.position.x, 0, controlledNPC.position.z);
    const lookDirection = cursorWorldPos.clone().sub(npcPos).normalize();
    const mouseRotationY = Math.atan2(lookDirection.x, lookDirection.z);

    // Handle movement to target position
    if (targetPosition) {
      const currentPos = new THREE.Vector3(newPosition.x, 0, newPosition.z);
      const distance = currentPos.distanceTo(targetPosition);

      if (distance > 0.1) {
        // Move towards target
        const moveDirection = targetPosition.clone().sub(currentPos).normalize();
        const speed = 3;

        newPosition.x += moveDirection.x * speed * deltaTime;
        newPosition.z += moveDirection.z * speed * deltaTime;

        // Face movement direction
        newRotation = Math.atan2(moveDirection.x, moveDirection.z);
        animation = "walking";
        
        console.log(`Moving NPC to: (${newPosition.x.toFixed(2)}, ${newPosition.z.toFixed(2)})`);
      } else {
        // Reached target, stop moving
        setTargetPosition(null);
        // Face mouse direction when not moving
        newRotation = mouseRotationY;
      }
    } else {
      // Not moving, face mouse direction
      newRotation = mouseRotationY;
    }

    // Update NPC
    updateNPC(controlledNPCId, {
      position: {
        x: newPosition.x,
        y: newPosition.y || 0,
        z: newPosition.z
      },
      rotation: newRotation,
      animation
    });

    // Debug: Log updated NPC state
    if (targetPosition) {
      console.log(`NPC ${controlledNPCId} updated:`, {
        position: newPosition,
        rotation: newRotation,
        animation
      });
    }

    // Update camera to follow NPC (isometric view)
    const isometricOffset = new THREE.Vector3(-8, 12, -8);
    const targetCameraPosition = new THREE.Vector3(newPosition.x, 0, newPosition.z).add(isometricOffset);
    const lookAtPosition = new THREE.Vector3(newPosition.x, 0, newPosition.z);

    camera.position.lerp(targetCameraPosition, 0.1);
    camera.lookAt(lookAtPosition.x, lookAtPosition.y, lookAtPosition.z);
  });

  return {
    isControlling: !!controlledNPCId,
    controlledNPCId,
    targetPosition,
    selectedEnemyId
  };
};