
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import FBXModel from './FBXModel';

interface FBXNPCModelProps {
  position: [number, number, number];
  type: "barbarian" | "knight" | "mage" | "rogue" | "rogue_hooded";
  animation?: "idle" | "walk";
  rotation?: number;
}

export default function FBXNPCModel({ 
  position, 
  type, 
  animation = "idle", 
  rotation = 0 
}: FBXNPCModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Model and texture mapping
  const modelConfigs = {
    barbarian: {
      modelPath: '/models/fbx/Barbarian.fbx',
      texturePath: '/models/fbx/barbarian_texture.png'
    },
    knight: {
      modelPath: '/models/fbx/Knight.fbx',
      texturePath: '/models/fbx/knight_texture.png'
    },
    mage: {
      modelPath: '/models/fbx/Mage.fbx',
      texturePath: '/models/fbx/mage_texture.png'
    },
    rogue: {
      modelPath: '/models/fbx/Rogue.fbx',
      texturePath: '/models/fbx/rogue_texture.png'
    },
    rogue_hooded: {
      modelPath: '/models/fbx/RogueHooded.fbx',
      texturePath: '/models/fbx/rogue_texture.png'
    }
  };

  const config = modelConfigs[type];

  // Safety check for config
  if (!config) {
    console.warn(`FBX model config not found for type: ${type}`);
    return (
      <group ref={groupRef}>
        {/* Fallback simple character */}
        <mesh position={[0, 1, 0]}>
          <boxGeometry args={[0.4, 0.8, 0.2]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#FDBCB4" />
        </mesh>
        {/* Shadow */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.4, 8]} />
          <meshBasicMaterial color="#000000" opacity={0.3} transparent />
        </mesh>
      </group>
    );
  }

  // Animation and movement logic
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    // Force update position every frame - critical for movement
    groupRef.current.position.x = position[0];
    groupRef.current.position.z = position[2];
    
    // Apply base Y position with animations
    const baseY = position[1];
    if (animation === "idle") {
      // Gentle breathing animation
      groupRef.current.position.y = baseY + Math.sin(time * 2) * 0.02;
    } else if (animation === "walk" || animation === "walking") {
      // Walking bob animation
      groupRef.current.position.y = baseY + Math.abs(Math.sin(time * 8)) * 0.05;
    } else {
      groupRef.current.position.y = baseY;
    }

    // Apply rotation
    groupRef.current.rotation.y = rotation;

    // Debug: Log position updates for moving NPCs
    if (animation === "walk" || animation === "walking") {
      console.log(`FBX Model Position: (${groupRef.current.position.x.toFixed(2)}, ${groupRef.current.position.z.toFixed(2)})`);
    }
  });

  return (
    <group ref={groupRef}>
      <FBXModel
        modelPath={config.modelPath}
        texturePath={config.texturePath}
        position={[0, 0, 0]}
        scale={[0.01, 0.01, 0.01]} // Scale down the model
        animation={animation}
      />
      
      {/* Shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 8]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}
