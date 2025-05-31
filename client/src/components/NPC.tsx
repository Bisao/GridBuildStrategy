
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface NPCProps {
  position: [number, number, number];
  color?: string;
  animation?: "idle" | "walk";
}

export default function NPC({ position, color = "#8B4513", animation = "idle" }: NPCProps) {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  // Animation logic
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    if (animation === "idle") {
      // Idle breathing animation
      if (headRef.current) {
        headRef.current.position.y = 1.6 + Math.sin(time * 2) * 0.02;
      }
      
      // Slight arm sway
      if (leftArmRef.current) {
        leftArmRef.current.rotation.z = Math.sin(time * 1.5) * 0.1;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.z = -Math.sin(time * 1.5) * 0.1;
      }
    } else if (animation === "walk") {
      // Walking animation
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(time * 4) * 0.5;
        rightArmRef.current.rotation.x = -Math.sin(time * 4) * 0.5;
      }
      
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(time * 4) * 0.3;
        rightLegRef.current.rotation.x = -Math.sin(time * 4) * 0.3;
      }
      
      // Bob up and down while walking
      groupRef.current.position.y = position[1] + Math.abs(Math.sin(time * 8)) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.4, 0.8, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 1.6, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#FDBCB4" />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.08, 1.65, 0.12]}>
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[0.08, 1.65, 0.12]}>
        <boxGeometry args={[0.04, 0.04, 0.04]} />
        <meshStandardMaterial color="#000000" />
      </mesh>

      {/* Nose */}
      <mesh position={[0, 1.6, 0.13]}>
        <boxGeometry args={[0.02, 0.02, 0.02]} />
        <meshStandardMaterial color="#FDBCB4" />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[0.32, 0.15, 0.32]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.3, 1.2, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#FDBCB4" />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.3, 1.2, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#FDBCB4" />
      </mesh>

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.1, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.1, 0.3, 0]}>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#4169E1" />
      </mesh>

      {/* Feet */}
      <mesh position={[-0.1, 0.05, 0.05]}>
        <boxGeometry args={[0.18, 0.1, 0.25]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0.1, 0.05, 0.05]}>
        <boxGeometry args={[0.18, 0.1, 0.25]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Shadow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.4, 8]} />
        <meshBasicMaterial color="#000000" opacity={0.3} transparent />
      </mesh>
    </group>
  );
}
