
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface BlacksmithProps {
  isPreview?: boolean;
  canPlace?: boolean;
  position?: { x: number; z: number };
  onStructureClick?: (position: { x: number; z: number }) => void;
}

const Blacksmith = ({ isPreview = false, canPlace = true, position, onStructureClick }: BlacksmithProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const smokeRef = useRef<THREE.Group>(null);

  const opacity = isPreview ? 0.7 : 1.0;
  const wallColor = isPreview ? (canPlace ? "#8B4513" : "#FF4444") : "#8B4513";
  const roofColor = isPreview ? (canPlace ? "#4682B4" : "#AA2222") : "#4682B4";

  // Animate smoke
  useFrame((state) => {
    if (smokeRef.current && !isPreview) {
      smokeRef.current.position.y = 1.8 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      smokeRef.current.rotation.y += 0.01;
    }
  });

  const handleClick = (event: any) => {
    if (!isPreview && position && onStructureClick) {
      event.stopPropagation();
      onStructureClick(position);
    }
  };

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Main building */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.0, 0.7, 0.8]} />
        <meshLambertMaterial 
          color={wallColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Roof - front slope */}
      <mesh position={[0, 0.9, 0.3]} rotation={[Math.PI/5, 0, 0]} castShadow>
        <boxGeometry args={[1.1, 0.08, 0.7]} />
        <meshLambertMaterial 
          color={roofColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Roof - back slope */}
      <mesh position={[0, 0.9, -0.3]} rotation={[-Math.PI/5, 0, 0]} castShadow>
        <boxGeometry args={[1.1, 0.08, 0.7]} />
        <meshLambertMaterial 
          color={roofColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Ridge beam */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[1.1, 0.05, 0.08]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Chimney */}
      <mesh position={[-0.3, 1.4, -0.2]} castShadow>
        <boxGeometry args={[0.15, 0.5, 0.15]} />
        <meshLambertMaterial 
          color="#696969"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Chimney top */}
      <mesh position={[-0.3, 1.7, -0.2]} castShadow>
        <boxGeometry args={[0.18, 0.05, 0.18]} />
        <meshLambertMaterial 
          color="#696969"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Smoke effect */}
      <group ref={smokeRef} position={[-0.3, 1.8, -0.2]}>
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial 
            color="#666666"
            transparent
            opacity={0.3}
          />
        </mesh>
        <mesh position={[0.02, 0.2, 0.01]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial 
            color="#888888"
            transparent
            opacity={0.2}
          />
        </mesh>
        <mesh position={[-0.01, 0.3, 0.02]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial 
            color="#AAAAAA"
            transparent
            opacity={0.1}
          />
        </mesh>
      </group>

      {/* Large door opening */}
      <mesh position={[0, 0.25, 0.41]} castShadow>
        <boxGeometry args={[0.3, 0.5, 0.02]} />
        <meshLambertMaterial 
          color="#000000"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Back door */}
      <mesh position={[0, 0.2, -0.41]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.02]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Anvil inside (visible through door) */}
      <mesh position={[0, 0.1, 0.2]} castShadow>
        <boxGeometry args={[0.1, 0.15, 0.05]} />
        <meshLambertMaterial 
          color="#2F4F4F"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Forge glow */}
      <mesh position={[-0.2, 0.15, 0.25]} castShadow>
        <boxGeometry args={[0.15, 0.1, 0.1]} />
        <meshBasicMaterial 
          color="#FF4500"
          transparent={isPreview}
          opacity={opacity * 0.6}
        />
      </mesh>

      {/* Tools hanging outside front */}
      <mesh position={[0.4, 0.4, 0.35]} rotation={[0, 0, Math.PI/6]} castShadow>
        <boxGeometry args={[0.02, 0.2, 0.02]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.35, 0.35, 0.35]} rotation={[0, 0, -Math.PI/6]} castShadow>
        <boxGeometry args={[0.02, 0.25, 0.02]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Tools hanging outside back */}
      <mesh position={[-0.4, 0.4, -0.35]} rotation={[0, 0, Math.PI/6]} castShadow>
        <boxGeometry args={[0.02, 0.18, 0.02]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[-0.35, 0.35, -0.35]} rotation={[0, 0, -Math.PI/6]} castShadow>
        <boxGeometry args={[0.02, 0.22, 0.02]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Side windows */}
      <mesh position={[0.51, 0.35, 0]} castShadow>
        <boxGeometry args={[0.02, 0.12, 0.12]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[-0.51, 0.35, 0]} castShadow>
        <boxGeometry args={[0.02, 0.12, 0.12]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Back window */}
      <mesh position={[0.3, 0.35, -0.41]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Metal storage outside */}
      <mesh position={[0.45, 0.05, 0.55]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.15]} />
        <meshLambertMaterial 
          color="#2F4F4F"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[-0.45, 0.05, 0.55]} castShadow>
        <boxGeometry args={[0.08, 0.08, 0.12]} />
        <meshLambertMaterial 
          color="#2F4F4F"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Coal pile */}
      <mesh position={[-0.4, 0.03, -0.6]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshLambertMaterial 
          color="#1C1C1C"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Water bucket */}
      <mesh position={[0.4, 0.05, -0.6]} castShadow>
        <cylinderGeometry args={[0.06, 0.05, 0.1, 8]} />
        <meshLambertMaterial 
          color="#8B4513"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Metal rods leaning against wall */}
      <mesh position={[0.48, 0.2, 0.2]} rotation={[0, 0, Math.PI/6]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.4, 6]} />
        <meshLambertMaterial 
          color="#2F4F4F"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.46, 0.18, 0.18]} rotation={[0, 0, Math.PI/7]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.36, 6]} />
        <meshLambertMaterial 
          color="#2F4F4F"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>
    </group>
  );
};

export default Blacksmith;
