
import { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../lib/stores/useGameState";

interface EnemyProps {
  id: string;
  position: { x: number; z: number };
  onDestroy?: (id: string) => void;
}

export default function Enemy({ id, position, onDestroy }: EnemyProps) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftEarRef = useRef<THREE.Mesh>(null);
  const rightEarRef = useRef<THREE.Mesh>(null);
  const [health, setHealth] = useState(100);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  const [attackCooldown, setAttackCooldown] = useState(0);
  const { createdNPCs, controlledNPCId } = useGameState();

  // Wolf AI and animation
  useFrame((state) => {
    if (!groupRef.current || !controlledNPCId) return;

    const time = state.clock.elapsedTime;
    const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
    if (!controlledNPC) return;

    const wolfPos = new THREE.Vector3(position.x, 0, position.z);
    const npcPos = new THREE.Vector3(controlledNPC.position.x, 0, controlledNPC.position.z);
    const distance = wolfPos.distanceTo(npcPos);

    // Wolf behavior
    if (distance > 2 && distance < 15) {
      // Move towards NPC
      const direction = npcPos.clone().sub(wolfPos).normalize();
      position.x += direction.x * 0.02;
      position.z += direction.z * 0.02;
      groupRef.current.position.set(position.x, 0, position.z);
      
      // Face the target
      const angle = Math.atan2(direction.x, direction.z);
      groupRef.current.rotation.y = angle;
      
      setIsMoving(true);
      setIsAttacking(false);
    } else if (distance <= 2) {
      // Attack if close enough
      setIsMoving(false);
      if (attackCooldown <= 0) {
        setIsAttacking(true);
        setAttackCooldown(120); // 2 seconds at 60fps
        
        // Deal damage to NPC
        const takeDamageFunc = (window as any)[`npc_${controlledNPCId}_takeDamage`];
        if (takeDamageFunc) {
          takeDamageFunc(15);
        }
      }
    } else {
      setIsMoving(false);
      setIsAttacking(false);
    }

    // Update attack cooldown
    if (attackCooldown > 0) {
      setAttackCooldown(prev => prev - 1);
    }

    // Wolf animations
    if (isMoving) {
      // Walking animation
      if (tailRef.current) {
        tailRef.current.rotation.z = Math.sin(time * 8) * 0.3;
      }
      
      // Head bobbing while walking
      if (headRef.current) {
        headRef.current.position.y = 0.8 + Math.sin(time * 8) * 0.05;
      }
      
      // Ear movement
      if (leftEarRef.current && rightEarRef.current) {
        leftEarRef.current.rotation.z = Math.sin(time * 6) * 0.1;
        rightEarRef.current.rotation.z = -Math.sin(time * 6) * 0.1;
      }
    } else {
      // Idle animation
      if (tailRef.current) {
        tailRef.current.rotation.z = Math.sin(time * 2) * 0.1;
      }
      
      if (headRef.current) {
        headRef.current.position.y = 0.8 + Math.sin(time * 3) * 0.02;
      }
      
      // Alert ear movement
      if (leftEarRef.current && rightEarRef.current) {
        leftEarRef.current.rotation.z = Math.sin(time * 4) * 0.05;
        rightEarRef.current.rotation.z = -Math.sin(time * 4) * 0.05;
      }
    }

    // Attack animation
    if (isAttacking) {
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(time * 20) * 0.2 - 0.1;
      }
    } else {
      if (headRef.current) {
        headRef.current.rotation.x = 0;
      }
    }
  });

  // Take damage function
  const takeDamage = (damage: number) => {
    setHealth(prev => {
      const newHealth = Math.max(0, prev - damage);
      if (newHealth <= 0 && onDestroy) {
        setTimeout(() => onDestroy(id), 100);
      }
      return newHealth;
    });
  };

  // Expose functions to global for testing and targeting
  useEffect(() => {
    (window as any)[`enemy_${id}_takeDamage`] = takeDamage;
    (window as any)[`enemy_${id}_setSelected`] = setIsSelected;
    
    // Add enemy to global enemies array with position reference
    if (!(window as any).enemies) {
      (window as any).enemies = [];
    }
    
    const enemyData = { id, position, takeDamage, setSelected: setIsSelected };
    const existingIndex = (window as any).enemies.findIndex((e: any) => e.id === id);
    
    if (existingIndex >= 0) {
      (window as any).enemies[existingIndex] = enemyData;
    } else {
      (window as any).enemies.push(enemyData);
    }
    
    return () => {
      delete (window as any)[`enemy_${id}_takeDamage`];
      delete (window as any)[`enemy_${id}_setSelected`];
      
      // Remove from global enemies array
      if ((window as any).enemies) {
        (window as any).enemies = (window as any).enemies.filter((e: any) => e.id !== id);
      }
    };
  }, [id, position]);

  const healthPercent = health / 100;
  const wolfColor = isAttacking ? "#8B4513" : "#696969";

  return (
    <group ref={groupRef} position={[position.x, 0, position.z]}>
      {/* Wolf Body */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.8, 0.4, 1.2]} />
        <meshStandardMaterial color={wolfColor} />
      </mesh>

      {/* Wolf Chest */}
      <mesh position={[0, 0.6, 0.3]} castShadow>
        <boxGeometry args={[0.6, 0.5, 0.8]} />
        <meshStandardMaterial color="#A0A0A0" />
      </mesh>

      {/* Wolf Head */}
      <mesh ref={headRef} position={[0, 0.8, 0.8]} castShadow>
        <boxGeometry args={[0.5, 0.4, 0.6]} />
        <meshStandardMaterial color={wolfColor} />
      </mesh>

      {/* Wolf Snout */}
      <mesh position={[0, 0.75, 1.1]} castShadow>
        <boxGeometry args={[0.25, 0.2, 0.3]} />
        <meshStandardMaterial color="#505050" />
      </mesh>

      {/* Wolf Nose */}
      <mesh position={[0, 0.8, 1.25]}>
        <boxGeometry args={[0.08, 0.06, 0.08]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Wolf Eyes */}
      <mesh position={[-0.12, 0.85, 1.0]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial color={isAttacking ? "#FF0000" : "#FFD700"} />
      </mesh>
      <mesh position={[0.12, 0.85, 1.0]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial color={isAttacking ? "#FF0000" : "#FFD700"} />
      </mesh>

      {/* Wolf Ears */}
      <mesh ref={leftEarRef} position={[-0.2, 1.0, 0.7]} rotation={[0.2, 0, 0]} castShadow>
        <coneGeometry args={[0.15, 0.3, 3]} />
        <meshStandardMaterial color={wolfColor} />
      </mesh>
      <mesh ref={rightEarRef} position={[0.2, 1.0, 0.7]} rotation={[0.2, 0, 0]} castShadow>
        <coneGeometry args={[0.15, 0.3, 3]} />
        <meshStandardMaterial color={wolfColor} />
      </mesh>

      {/* Wolf Legs */}
      <mesh position={[-0.25, 0.15, 0.4]} castShadow>
        <boxGeometry args={[0.15, 0.3, 0.15]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
      <mesh position={[0.25, 0.15, 0.4]} castShadow>
        <boxGeometry args={[0.15, 0.3, 0.15]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
      <mesh position={[-0.25, 0.15, -0.2]} castShadow>
        <boxGeometry args={[0.15, 0.3, 0.15]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
      <mesh position={[0.25, 0.15, -0.2]} castShadow>
        <boxGeometry args={[0.15, 0.3, 0.15]} />
        <meshStandardMaterial color="#404040" />
      </mesh>

      {/* Wolf Paws */}
      <mesh position={[-0.25, 0.05, 0.4]}>
        <boxGeometry args={[0.18, 0.1, 0.18]} />
        <meshStandardMaterial color="#2F2F2F" />
      </mesh>
      <mesh position={[0.25, 0.05, 0.4]}>
        <boxGeometry args={[0.18, 0.1, 0.18]} />
        <meshStandardMaterial color="#2F2F2F" />
      </mesh>
      <mesh position={[-0.25, 0.05, -0.2]}>
        <boxGeometry args={[0.18, 0.1, 0.18]} />
        <meshStandardMaterial color="#2F2F2F" />
      </mesh>
      <mesh position={[0.25, 0.05, -0.2]}>
        <boxGeometry args={[0.18, 0.1, 0.18]} />
        <meshStandardMaterial color="#2F2F2F" />
      </mesh>

      {/* Wolf Tail */}
      <mesh ref={tailRef} position={[0, 0.6, -0.8]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.6]} />
        <meshStandardMaterial color={wolfColor} />
      </mesh>

      {/* Wolf Markings */}
      <mesh position={[0, 0.7, 0.5]}>
        <boxGeometry args={[0.3, 0.1, 0.8]} />
        <meshStandardMaterial color="#D3D3D3" />
      </mesh>

      {/* Health bar */}
      <group position={[0, 1.5, 0]}>
        {/* Background */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.8, 0.1]} />
          <meshBasicMaterial color="#333333" side={THREE.DoubleSide} />
        </mesh>
        {/* Health fill */}
        <mesh position={[-(0.4 * (1 - healthPercent)), 0, 0.01]} scale={[healthPercent, 1, 1]}>
          <planeGeometry args={[0.8, 0.08]} />
          <meshBasicMaterial color={healthPercent > 0.3 ? "#00FF00" : "#FF0000"} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.8, 1.0, 16]} />
          <meshBasicMaterial color="#FF0000" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Attack indicator */}
      {isAttacking && (
        <mesh position={[0, 0.8, 1.3]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color="#FF4444" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Wolf Teeth (when attacking) */}
      {isAttacking && (
        <>
          <mesh position={[-0.08, 0.72, 1.2]}>
            <coneGeometry args={[0.02, 0.1, 3]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
          <mesh position={[0.08, 0.72, 1.2]}>
            <coneGeometry args={[0.02, 0.1, 3]} />
            <meshStandardMaterial color="#FFFFFF" />
          </mesh>
        </>
      )}
    </group>
  );
}
