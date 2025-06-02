
import { useRef, useEffect } from "react";
import * as THREE from "three";

interface WolfSpawnProps {
  position: { x: number; z: number };
  id: string;
}

export default function WolfSpawn({ position, id }: WolfSpawnProps) {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // Visual indicator for spawn point
    const spawnIndicator = new THREE.RingGeometry(0.8, 1.0, 16);
    const spawnMaterial = new THREE.MeshBasicMaterial({ 
      color: "#FF4444", 
      transparent: true, 
      opacity: 0.3 
    });
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  return (
    <group ref={groupRef} position={[position.x, 0.01, position.z]}>
      {/* Spawn point visual indicator */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1.0, 16]} />
        <meshBasicMaterial color="#FF4444" transparent opacity={0.3} />
      </mesh>
      
      {/* Inner circle */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.6, 16]} />
        <meshBasicMaterial color="#AA2222" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}
