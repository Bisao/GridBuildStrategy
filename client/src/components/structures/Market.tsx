
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Market({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotation;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base do mercado */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.6, 1.8]} />
        <meshLambertMaterial color="#DEB887" />
      </mesh>
      
      {/* Telhado */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <coneGeometry args={[1.4, 0.6, 4]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
      
      {/* Balcão de vendas */}
      <mesh position={[0, 0.75, 0.95]} castShadow>
        <boxGeometry args={[1.6, 0.3, 0.1]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
      
      {/* Caixas de mercadorias */}
      <mesh position={[-0.4, 0.15, 0.7]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.2]} />
        <meshLambertMaterial color="#CD853F" />
      </mesh>
      
      <mesh position={[0.4, 0.15, 0.7]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.2]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>
    </group>
  );
}
