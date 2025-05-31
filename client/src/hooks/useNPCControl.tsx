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
  const [isAttacking, setIsAttacking] = useState(false);
  const attackCooldown = useRef(0);

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

    const handleRightClick = (event: MouseEvent) => {
      event.preventDefault();
      
      if (attackCooldown.current <= 0) {
        setIsAttacking(true);
        attackCooldown.current = 1.0; // 1 segundo de cooldown
        
        // Atacar NPCs próximos
        performAttack();
        
        setTimeout(() => setIsAttacking(false), 500);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('contextmenu', handleRightClick);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('contextmenu', handleRightClick);
    };
  }, [controlledNPCId]);

  const performAttack = () => {
    const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
    if (!controlledNPC || controlledNPC.isDead) return;

    const attackRange = 2.0;
    const damage = controlledNPC.type === "guard" ? 30 : 20;

    // Encontrar NPCs próximos para atacar
    const nearbyNPCs = createdNPCs.filter(npc => {
      if (npc.id === controlledNPCId || npc.isDead) return false;
      
      const distance = Math.sqrt(
        Math.pow(npc.position.x - controlledNPC.position.x, 2) + 
        Math.pow(npc.position.z - controlledNPC.position.z, 2)
      );
      
      return distance <= attackRange;
    });

    // Atacar o NPC mais próximo
    if (nearbyNPCs.length > 0) {
      const target = nearbyNPCs[0];
      const newHp = Math.max(0, (target.hp || 0) - damage);
      
      updateNPC(target.id, {
        hp: newHp,
        animation: newHp > 0 ? 'hurt' : 'death',
        isInCombat: newHp > 0,
        isDead: newHp <= 0
      });

      console.log(`${controlledNPC.name} atacou ${target.name} causando ${damage} de dano!`);
      
      // Voltar para idle após ser ferido
      if (newHp > 0) {
        setTimeout(() => {
          updateNPC(target.id, { animation: 'idle' });
        }, 1000);
      }
    }
  };

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

    // Update attack cooldown
    if (attackCooldown.current > 0) {
      attackCooldown.current -= deltaTime;
    }

    // Update NPC position and animation
    const newPosition = {
      x: controlledNPC.position.x + movement.x,
      z: controlledNPC.position.z + movement.z
    };

    // Determinar animação baseada no estado
    let currentAnimation = 'idle';
    if (isAttacking) {
      currentAnimation = 'attack';
    } else if (isMoving) {
      currentAnimation = 'walk';
    }

    // Always update NPC to look at cursor position
    updateNPC(controlledNPCId, {
      position: newPosition,
      animation: currentAnimation,
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