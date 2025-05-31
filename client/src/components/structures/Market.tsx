
import { useRef } from "react";
import * as THREE from "three";

interface MarketProps {
  isPreview?: boolean;
  canPlace?: boolean;
  position?: { x: number; z: number };
  onStructureClick?: (position: { x: number; z: number }) => void;
}

const Market = ({ isPreview = false, canPlace = true, position, onStructureClick }: MarketProps) => {
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
      {/* Main market hall */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[1.4, 0.6, 1.0]} />
        <meshLambertMaterial 
          color={wallColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Roof - front slope */}
      <mesh position={[0, 0.85, 0.35]} rotation={[-Math.PI/5, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 0.08, 0.8]} />
        <meshLambertMaterial 
          color={roofColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Roof - back slope */}
      <mesh position={[0, 0.85, -0.35]} rotation={[Math.PI/5, 0, 0]} castShadow>
        <boxGeometry args={[1.5, 0.08, 0.8]} />
        <meshLambertMaterial 
          color={roofColor}
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Ridge beam */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[1.5, 0.05, 0.1]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Market stalls - left front */}
      <mesh position={[-0.8, 0.15, 0.7]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial 
          color="#D2691E"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Market stalls - right front */}
      <mesh position={[0.8, 0.15, 0.7]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial 
          color="#D2691E"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Market stalls - left back */}
      <mesh position={[-0.8, 0.15, -0.7]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial 
          color="#D2691E"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Market stalls - right back */}
      <mesh position={[0.8, 0.15, -0.7]} castShadow>
        <boxGeometry args={[0.3, 0.3, 0.2]} />
        <meshLambertMaterial 
          color="#D2691E"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Awnings front */}
      <mesh position={[-0.8, 0.35, 0.7]} castShadow>
        <boxGeometry args={[0.35, 0.02, 0.25]} />
        <meshLambertMaterial 
          color="#DC143C"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.8, 0.35, 0.7]} castShadow>
        <boxGeometry args={[0.35, 0.02, 0.25]} />
        <meshLambertMaterial 
          color="#228B22"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Awnings back */}
      <mesh position={[-0.8, 0.35, -0.7]} castShadow>
        <boxGeometry args={[0.35, 0.02, 0.25]} />
        <meshLambertMaterial 
          color="#FF8C00"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.8, 0.35, -0.7]} castShadow>
        <boxGeometry args={[0.35, 0.02, 0.25]} />
        <meshLambertMaterial 
          color="#9932CC"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Support posts */}
      <mesh position={[-0.95, 0.25, 0.6]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.95, 0.25, 0.6]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[-0.95, 0.25, -0.6]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.95, 0.25, -0.6]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.5, 8]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Main entrance */}
      <mesh position={[0, 0.2, 0.51]} castShadow>
        <boxGeometry args={[0.25, 0.4, 0.02]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Back door */}
      <mesh position={[0, 0.2, -0.51]} castShadow>
        <boxGeometry args={[0.2, 0.35, 0.02]} />
        <meshLambertMaterial 
          color="#654321"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Windows front */}
      <mesh position={[-0.4, 0.35, 0.51]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.4, 0.35, 0.51]} castShadow>
        <boxGeometry args={[0.15, 0.15, 0.02]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Windows back */}
      <mesh position={[-0.3, 0.35, -0.51]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.3, 0.35, -0.51]} castShadow>
        <boxGeometry args={[0.12, 0.12, 0.02]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Side windows */}
      <mesh position={[-0.71, 0.35, 0]} castShadow>
        <boxGeometry args={[0.02, 0.12, 0.12]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.71, 0.35, 0]} castShadow>
        <boxGeometry args={[0.02, 0.12, 0.12]} />
        <meshLambertMaterial 
          color="#87CEEB"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Market goods front */}
      <mesh position={[-0.8, 0.32, 0.75]} castShadow>
        <boxGeometry args={[0.08, 0.06, 0.08]} />
        <meshLambertMaterial 
          color="#FF6347"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.8, 0.32, 0.75]} castShadow>
        <boxGeometry args={[0.06, 0.08, 0.06]} />
        <meshLambertMaterial 
          color="#32CD32"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Market goods back */}
      <mesh position={[-0.8, 0.32, -0.75]} castShadow>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshLambertMaterial 
          color="#FFD700"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.8, 0.32, -0.75]} castShadow>
        <boxGeometry args={[0.08, 0.06, 0.08]} />
        <meshLambertMaterial 
          color="#8A2BE2"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Sign */}
      <mesh position={[0, 0.8, 0.6]} castShadow>
        <boxGeometry args={[0.3, 0.1, 0.02]} />
        <meshLambertMaterial 
          color="#8B4513"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      {/* Decorative barrels */}
      <mesh position={[-0.5, 0.1, 0.8]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
        <meshLambertMaterial 
          color="#8B4513"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>

      <mesh position={[0.5, 0.1, 0.8]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 8]} />
        <meshLambertMaterial 
          color="#8B4513"
          transparent={isPreview}
          opacity={opacity}
        />
      </mesh>
    </group>
  );
};

export default Market;
