import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Blacksmith({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotation;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base da ferraria */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.6, 1.4]} />
        <meshLambertMaterial color="#696969" />
      </mesh>

      {/* Telhado */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <coneGeometry args={[1.2, 0.5, 4]} />
        <meshLambertMaterial color="#2F4F4F" />
      </mesh>

      {/* Chaminé */}
      <mesh position={[0.4, 1.2, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshLambertMaterial color="#2F4F4F" />
      </mesh>

      {/* Bigorna */}
      <mesh position={[0, 0.75, 0.8]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial color="#2F4F4F" />
      </mesh>

      {/* Porta */}
      <mesh position={[0, 0.25, 0.71]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.02]} />
        <meshLambertMaterial color="#654321" />
      </mesh>
    </group>
  );
}