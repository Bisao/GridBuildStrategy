import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Windmill({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const bladesRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotation;
    }
    if (bladesRef.current) {
      bladesRef.current.rotation.z += 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base do moinho */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.8, 1.2]} />
        <meshLambertMaterial color="#DEB887" />
      </mesh>

      {/* Topo */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <coneGeometry args={[0.7, 0.4, 8]} />
        <meshLambertMaterial color="#8B4513" />
      </mesh>

      {/* Eixo das pás */}
      <mesh position={[0, 1.0, 0.85]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.3]} />
        <meshLambertMaterial color="#654321" />
      </mesh>

      {/* Pás do moinho */}
      <group ref={bladesRef} position={[0, 1.0, 0.85]}>
        <mesh position={[0.6, 0, 0]} castShadow>
          <boxGeometry args={[0.8, 0.05, 0.1]} />
          <meshLambertMaterial color="#F5F5DC" />
        </mesh>
        <mesh position={[-0.6, 0, 0]} castShadow>
          <boxGeometry args={[0.8, 0.05, 0.1]} />
          <meshLambertMaterial color="#F5F5DC" />
        </mesh>
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[0.05, 0.8, 0.1]} />
          <meshLambertMaterial color="#F5F5DC" />
        </mesh>
        <mesh position={[0, -0.6, 0]} castShadow>
          <boxGeometry args={[0.05, 0.8, 0.1]} />
          <meshLambertMaterial color="#F5F5DC" />
        </mesh>
      </group>

      {/* Porta */}
      <mesh position={[0, 0.4, 0.81]} castShadow>
        <boxGeometry args={[0.3, 0.6, 0.02]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
    </group>
  );
}