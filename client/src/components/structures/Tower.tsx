import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Tower({ position, rotation = 0 }: { position: [number, number, number], rotation?: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = rotation;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Base da torre */}
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.6, 0.8, 1.6]} />
        <meshLambertMaterial color="#708090" />
      </mesh>

      {/* Topo da torre */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.6, 0.6]} />
        <meshLambertMaterial color="#696969" />
      </mesh>

      {/* Telhado cônico */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <coneGeometry args={[0.5, 0.6, 8]} />
        <meshLambertMaterial color="#2F4F4F" />
      </mesh>

      {/* Janelas */}
      <mesh position={[0, 1.2, 0.61]} castShadow>
        <boxGeometry args={[0.2, 0.3, 0.02]} />
        <meshLambertMaterial color="#000080" />
      </mesh>

      <mesh position={[0.61, 1.2, 0]} castShadow>
        <boxGeometry args={[0.02, 0.3, 0.2]} />
        <meshLambertMaterial color="#000080" />
      </mesh>
    </group>
  );
}