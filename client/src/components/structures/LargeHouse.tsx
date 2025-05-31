import { useRef } from "react";
import * as THREE from "three";

interface LargeHouseProps {
  isPreview?: boolean;
  canPlace?: boolean;
  position?: { x: number; z: number };
  onStructureClick?: (position: { x: number; z: number }) => void;
}

const LargeHouse = ({ isPreview = false, canPlace = true, position, onStructureClick }: LargeHouseProps) => {
  const groupRef = useRef<THREE.Group>(null);

  const opacity = isPreview ? 0.7 : 1.0;
  const wallColor = isPreview ? (canPlace ? "#8B4513" : "#FF4444") : "#8B4513";
  const roofColor = isPreview ? (canPlace ? "#4682B4" : "#AA2222") : "#4682B4";

  const handleClick = (event: any) => {
    if (!isPreview && position && onStructureClick) {
      event.stopPropagation();
      onStructureClick(position);
    }
  };

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Main building */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.2, 0.8, 1.0]} />
        <meshLambertMaterial 
          color={wallColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Left wing */}
      <mesh position={[-0.8, 0.3, 0.2]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshLambertMaterial 
          color={wallColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Right wing */}
      <mesh position={[0.8, 0.3, 0.2]} castShadow>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshLambertMaterial 
          color={wallColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Main roof - front slope */}
      <mesh position={[0, 1.05, 0.3]} rotation={[Math.PI/6, 0, 0]} castShadow>
        <boxGeometry args={[1.3, 0.08, 0.7]} />
        <meshLambertMaterial 
          color={roofColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Main roof - back slope */}
      <mesh position={[0, 1.05, -0.3]} rotation={[-Math.PI/6, 0, 0]} castShadow>
        <boxGeometry args={[1.3, 0.08, 0.7]} />
        <meshLambertMaterial 
          color={roofColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Left wing roof - front */}
      <mesh position={[-0.8, 0.75, 0.35]} rotation={[Math.PI/6, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.06, 0.4]} />
        <meshLambertMaterial 
          color={roofColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Left wing roof - back */}
      <mesh position={[-0.8, 0.75, 0.05]} rotation={[-Math.PI/6, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.06, 0.4]} />
        <meshLambertMaterial 
          color={roofColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Right wing roof - front */}
      <mesh position={[0.8, 0.75, 0.35]} rotation={[Math.PI/6, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.06, 0.4]} />
        <meshLambertMaterial 
          color={roofColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Right wing roof - back */}
      <mesh position={[0.8, 0.75, 0.05]} rotation={[-Math.PI/6, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.06, 0.4]} />
        <meshLambertMaterial 
          color={roofColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Chimney */}
      <mesh position={[0.4, 1.6, -0.2]} castShadow>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshLambertMaterial 
          color="#696969"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Main door */}
      <mesh position={[0, 0.2, 0.51]} castShadow>
        <boxGeometry args={[0.2, 0.4, 0.02]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Door handle */}
      <mesh position={[0.08, 0.2, 0.52]} castShadow>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshLambertMaterial 
          color="#FFD700"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Windows - main building front */}
      <mesh position={[-0.3, 0.4, 0.51]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.3, 0.4, 0.51]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Windows - main building back */}
      <mesh position={[-0.3, 0.4, -0.51]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.3, 0.4, -0.51]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Windows - left side */}
      <mesh position={[-0.61, 0.4, 0]} castShadow>
        <boxGeometry args={[0.02, 0.15, 0.15]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Windows - right side */}
      <mesh position={[0.61, 0.4, 0]} castShadow>
        <boxGeometry args={[0.02, 0.15, 0.15]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Left wing windows */}
      <mesh position={[-0.8, 0.3, 0.51]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[-0.8, 0.3, -0.11]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Right wing windows */}
      <mesh position={[0.8, 0.3, 0.51]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.8, 0.3, -0.11]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Decorative beams */}
      <mesh position={[-0.2, 0.6, 0.51]} castShadow>
        <boxGeometry args={[0.05, 0.4, 0.02]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.2, 0.6, 0.51]} castShadow>
        <boxGeometry args={[0.05, 0.4, 0.02]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Window frames */}
      <mesh position={[-0.3, 0.4, 0.52]} castShadow>
        <boxGeometry args={[0.18, 0.18, 0.01]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.3, 0.4, 0.52]} castShadow>
        <boxGeometry args={[0.18, 0.18, 0.01]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Garden decorations */}
      <mesh position={[-0.4, 0.05, 0.7]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshLambertMaterial 
          color="#228B22"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.4, 0.05, 0.7]} castShadow>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshLambertMaterial 
          color="#228B22"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Steps to main door */}
      <mesh position={[0, 0.05, 0.6]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.1]} />
        <meshLambertMaterial 
          color="#696969"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0, 0.1, 0.65]} castShadow>
        <boxGeometry args={[0.25, 0.1, 0.05]} />
        <meshLambertMaterial 
          color="#696969"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>
    </group>
  );
};

export default LargeHouse;