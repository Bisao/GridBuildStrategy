
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function LargeHouse({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotation;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base da casa */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.8, 1.6]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Telhado */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <coneGeometry args={[1.8, 0.8, 4]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
      
      {/* Porta */}
      <mesh position={[0, 0.3, 0.81]} castShadow>
        <boxGeometry args={[0.3, 0.6, 0.02]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
      
      {/* Janelas */}
      <mesh position={[-0.6, 0.6, 0.81]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.02]} />
        <meshLambertMaterial color="#87CEEB" />
      </mesh>
      
      <mesh position={[0.6, 0.6, 0.81]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.02]} />
        <meshLambertMaterial color="#87CEEB" />
      </mesh>
    </group>
  );
}
