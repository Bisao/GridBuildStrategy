
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
  const [health, setHealth] = useState(100);
  const [isAttacking, setIsAttacking] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const { createdNPCs, controlledNPCId } = useGameState();

  // Simple AI: move towards controlled NPC
  useFrame(() => {
    if (!groupRef.current || !controlledNPCId) return;

    const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
    if (!controlledNPC) return;

    const enemyPos = new THREE.Vector3(position.x, 0, position.z);
    const npcPos = new THREE.Vector3(controlledNPC.position.x, 0, controlledNPC.position.z);
    const distance = enemyPos.distanceTo(npcPos);

    // Move towards NPC if too far
    if (distance > 1.5 && distance < 10) {
      const direction = npcPos.clone().sub(enemyPos).normalize();
      position.x += direction.x * 0.01;
      position.z += direction.z * 0.01;
      groupRef.current.position.set(position.x, 0, position.z);
    }

    // Attack if close enough
    if (distance < 1.5) {
      setIsAttacking(true);
    } else {
      setIsAttacking(false);
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
  const enemyColor = isAttacking ? "#FF4444" : "#8B0000";

  return (
    <group ref={groupRef} position={[position.x, 0, position.z]}>
      {/* Enemy body */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.4, 0.8, 0.2]} />
        <meshStandardMaterial color={enemyColor} />
      </mesh>

      {/* Enemy head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Evil eyes */}
      <mesh position={[-0.08, 1.65, 0.12]}>
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>
      <mesh position={[0.08, 1.65, 0.12]}>
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <meshStandardMaterial color="#FF0000" />
      </mesh>

      {/* Health bar */}
      <group position={[0, 2.2, 0]}>
        {/* Background */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.6, 0.1]} />
          <meshBasicMaterial color="#333333" side={THREE.DoubleSide} />
        </mesh>
        {/* Health fill */}
        <mesh position={[-(0.3 * (1 - healthPercent)), 0, 0.01]} scale={[healthPercent, 1, 1]}>
          <planeGeometry args={[0.6, 0.08]} />
          <meshBasicMaterial color={healthPercent > 0.3 ? "#00FF00" : "#FF0000"} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Selection indicator - red circle on ground */}
      {isSelected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.8, 16]} />
          <meshBasicMaterial color="#FF0000" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Attack indicator */}
      {isAttacking && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshBasicMaterial color="#FF0000" transparent opacity={0.3} />
        </mesh>
      )}

      {/* Weapon - crude sword */}
      <mesh position={[0.3, 1.2, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.05, 0.6, 0.02]} />
        <meshStandardMaterial color="#C0C0C0" />
      </mesh>

      {/* Weapon handle */}
      <mesh position={[0.25, 0.9, 0]} castShadow>
        <boxGeometry args={[0.03, 0.2, 0.03]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}
