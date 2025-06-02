
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { generateSandTexture } from "./TextureGenerator";

interface TerrainProps {
  onPointerMove: (event: any) => void;
  onClick: (event: any) => void;
  hoveredTile: { x: number; z: number } | null;
}

// Bioma types
type BiomeType = 'grass' | 'desert' | 'water' | 'forest' | 'mountain' | 'snow';

interface TerrainTile {
  x: number;
  z: number;
  biome: BiomeType;
  height: number;
  hasTree?: boolean;
  hasRock?: boolean;
}

const Terrain = ({ onPointerMove, onClick, hoveredTile }: TerrainProps) => {
  const terrainRef = useRef<THREE.Group>(null);
  
  // Load textures for different biomes
  const grassTexture = useTexture("/textures/grass.png");
  const sandTexture = useMemo(() => generateSandTexture(), []);
  
  // Configure textures
  grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(1, 1);
  sandTexture.wrapS = sandTexture.wrapT = THREE.RepeatWrapping;
  sandTexture.repeat.set(1, 1);

  const GRID_SIZE = 30;
  const TILE_SIZE = 1;

  // Generate terrain with biomes using Perlin-like noise simulation
  const terrainData = useMemo(() => {
    const tiles: TerrainTile[] = [];
    
    // Simple noise function simulation
    const noise = (x: number, z: number) => {
      return (Math.sin(x * 0.1) + Math.cos(z * 0.15) + Math.sin((x + z) * 0.08)) / 3;
    };

    const moistureNoise = (x: number, z: number) => {
      return (Math.sin(x * 0.12) + Math.cos(z * 0.11) + Math.sin((x - z) * 0.09)) / 3;
    };

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const worldX = x - GRID_SIZE / 2 + 0.5;
        const worldZ = z - GRID_SIZE / 2 + 0.5;
        
        const elevation = noise(x, z);
        const moisture = moistureNoise(x, z);
        const distanceFromCenter = Math.sqrt(worldX * worldX + worldZ * worldZ);
        
        let biome: BiomeType;
        let height = Math.max(0, elevation * 0.5);
        let hasTree = false;
        let hasRock = false;

        // Determine biome based on elevation, moisture, and distance
        if (elevation < -0.3) {
          biome = 'water';
          height = -0.1;
        } else if (elevation > 0.4) {
          biome = elevation > 0.6 ? 'snow' : 'mountain';
          height = elevation * 0.8;
          hasRock = Math.random() > 0.7;
        } else if (moisture < -0.2 && elevation > 0) {
          biome = 'desert';
          height = elevation * 0.3;
        } else if (moisture > 0.2) {
          biome = 'forest';
          height = elevation * 0.4;
          hasTree = Math.random() > 0.6;
        } else {
          biome = 'grass';
          height = elevation * 0.3;
          hasTree = Math.random() > 0.9;
        }

        // Create water around edges
        if (distanceFromCenter > GRID_SIZE * 0.4) {
          biome = 'water';
          height = -0.1;
          hasTree = false;
          hasRock = false;
        }

        tiles.push({
          x: worldX,
          z: worldZ,
          biome,
          height,
          hasTree,
          hasRock
        });
      }
    }
    
    return tiles;
  }, []);

  // Get biome colors and materials
  const getBiomeMaterial = (biome: BiomeType, isHovered: boolean) => {
    const baseColors = {
      grass: isHovered ? "#90EE90" : "#228B22",
      desert: isHovered ? "#F4E4BC" : "#DEB887",
      water: isHovered ? "#87CEEB" : "#4682B4",
      forest: isHovered ? "#32CD32" : "#006400",
      mountain: isHovered ? "#A9A9A9" : "#696969",
      snow: isHovered ? "#FFFAFA" : "#F0F8FF"
    };

    if (biome === 'grass' || biome === 'forest') {
      return <meshLambertMaterial map={grassTexture} color={baseColors[biome]} />;
    } else if (biome === 'desert') {
      return <meshLambertMaterial map={sandTexture} color={baseColors[biome]} />;
    } else {
      return <meshLambertMaterial color={baseColors[biome]} />;
    }
  };

  // Create terrain tiles
  const tiles = terrainData.map((tile) => {
    const isHovered = hoveredTile && hoveredTile.x === tile.x && hoveredTile.z === tile.z;
    
    return (
      <group key={`tile-${tile.x}-${tile.z}`} position={[tile.x, tile.height, tile.z]}>
        {/* Base terrain tile */}
        <mesh 
          receiveShadow
          userData={{ gridX: tile.x, gridZ: tile.z, isGridTile: true }}
          onPointerMove={onPointerMove}
          onClick={onClick}
        >
          <boxGeometry args={[TILE_SIZE, 0.2, TILE_SIZE]} />
          {getBiomeMaterial(tile.biome, isHovered)}
        </mesh>
        
        {/* Tile border for hovered state */}
        {isHovered && (
          <mesh 
            position={[0, 0.11, 0]}
            onPointerMove={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <boxGeometry args={[TILE_SIZE + 0.02, 0.02, TILE_SIZE + 0.02]} />
            <meshBasicMaterial color="#FFFF00" transparent opacity={0.8} />
          </mesh>
        )}

        {/* Trees for forest biome */}
        {tile.hasTree && (
          <group 
            position={[Math.random() * 0.4 - 0.2, 0.1, Math.random() * 0.4 - 0.2]}
            onPointerMove={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tree trunk */}
            <mesh position={[0, 0.3, 0]} castShadow>
              <cylinderGeometry args={[0.05, 0.08, 0.6, 6]} />
              <meshLambertMaterial color="#8B4513" />
            </mesh>
            {/* Tree leaves */}
            <mesh position={[0, 0.7, 0]} castShadow>
              <coneGeometry args={[0.3, 0.8, 8]} />
              <meshLambertMaterial color="#228B22" />
            </mesh>
          </group>
        )}

        {/* Rocks for mountain biome */}
        {tile.hasRock && (
          <mesh 
            position={[Math.random() * 0.3 - 0.15, 0.15, Math.random() * 0.3 - 0.15]} 
            castShadow
            rotation={[0, Math.random() * Math.PI, 0]}
            onPointerMove={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <dodecahedronGeometry args={[0.1 + Math.random() * 0.1]} />
            <meshLambertMaterial color="#696969" />
          </mesh>
        )}

        {/* Water animation effect */}
        {tile.biome === 'water' && (
          <mesh 
            position={[0, 0.05, 0]}
            onPointerMove={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <planeGeometry args={[TILE_SIZE * 0.9, TILE_SIZE * 0.9]} />
            <meshBasicMaterial 
              color="#87CEEB" 
              transparent 
              opacity={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </group>
    );
  });

  return (
    <group ref={terrainRef}>
      {tiles}
      
      {/* Ambient elements */}
      {/* Add some clouds */}
      <group 
        position={[0, 8, 0]}
        onPointerMove={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <mesh 
            key={`cloud-${i}`}
            position={[
              (Math.random() - 0.5) * 40,
              Math.random() * 3,
              (Math.random() - 0.5) * 40
            ]}
            onPointerMove={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <sphereGeometry args={[1 + Math.random(), 8, 6]} />
            <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

export default Terrain;
