
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { generateSandTexture } from "./TextureGenerator";

interface TerrainProps {
  onPointerMove: (event: any) => void;
  onClick: (event: any) => void;
  hoveredTile: { x: number; z: number } | null;
}

// Bioma types inspired by Albion Online
type BiomeType = 'grass' | 'desert' | 'water' | 'forest' | 'mountain' | 'snow' | 'swamp' | 'steppe' | 'highlands';

interface TerrainTile {
  x: number;
  z: number;
  biome: BiomeType;
  height: number;
  hasTree?: boolean;
  hasRock?: boolean;
  hasResource?: string; // 'stone', 'fiber', 'wood', 'ore'
  fertility?: number; // For farming areas
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

  const GRID_SIZE = 40; // Increased for more realistic world
  const TILE_SIZE = 1;

  // Generate Albion-style terrain with more realistic biome distribution
  const terrainData = useMemo(() => {
    const tiles: TerrainTile[] = [];
    
    // Multi-octave noise for more realistic terrain
    const noise = (x: number, z: number, scale: number = 0.1) => {
      const octave1 = Math.sin(x * scale) * Math.cos(z * scale);
      const octave2 = Math.sin(x * scale * 2) * Math.cos(z * scale * 2) * 0.5;
      const octave3 = Math.sin(x * scale * 4) * Math.cos(z * scale * 4) * 0.25;
      return (octave1 + octave2 + octave3) / 1.75;
    };

    const moistureNoise = (x: number, z: number) => {
      return (Math.sin(x * 0.08) + Math.cos(z * 0.12) + Math.sin((x + z) * 0.06)) / 3;
    };

    const temperatureNoise = (x: number, z: number) => {
      return (Math.sin(x * 0.05) + Math.cos(z * 0.07) + Math.sin((x * z) * 0.001)) / 3;
    };

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const worldX = x - GRID_SIZE / 2 + 0.5;
        const worldZ = z - GRID_SIZE / 2 + 0.5;
        
        const elevation = noise(x, z, 0.08);
        const moisture = moistureNoise(x, z);
        const temperature = temperatureNoise(x, z);
        const distanceFromCenter = Math.sqrt(worldX * worldX + worldZ * worldZ);
        
        let biome: BiomeType;
        let height = Math.max(0, elevation * 0.8);
        let hasTree = false;
        let hasRock = false;
        let hasResource: string | undefined = undefined;
        let fertility = 0;

        // Albion-style biome determination
        if (elevation < -0.4) {
          biome = 'water';
          height = -0.15;
        } else if (elevation > 0.6) {
          if (temperature < -0.3) {
            biome = 'snow';
            height = elevation * 1.2;
            hasRock = Math.random() > 0.6;
            if (Math.random() > 0.8) hasResource = 'ore';
          } else {
            biome = 'mountain';
            height = elevation * 1.0;
            hasRock = Math.random() > 0.5;
            if (Math.random() > 0.7) hasResource = 'stone';
          }
        } else if (moisture < -0.4 && temperature > 0.2) {
          biome = 'desert';
          height = elevation * 0.4;
          if (Math.random() > 0.9) hasResource = 'fiber';
        } else if (moisture > 0.4 && elevation > 0.1) {
          if (temperature > 0) {
            biome = 'forest';
            height = elevation * 0.6;
            hasTree = Math.random() > 0.4;
            if (Math.random() > 0.8) hasResource = 'wood';
          } else {
            biome = 'highlands';
            height = elevation * 0.7;
            hasTree = Math.random() > 0.7;
            hasRock = Math.random() > 0.8;
          }
        } else if (moisture > 0.2 && elevation < 0.2) {
          biome = 'swamp';
          height = elevation * 0.2;
          if (Math.random() > 0.85) hasTree = true;
          if (Math.random() > 0.9) hasResource = 'fiber';
        } else if (moisture < 0 && temperature < 0) {
          biome = 'steppe';
          height = elevation * 0.5;
          if (Math.random() > 0.95) hasTree = true;
          fertility = Math.random() > 0.7 ? 1 : 0;
        } else {
          biome = 'grass';
          height = elevation * 0.5;
          hasTree = Math.random() > 0.85;
          fertility = Math.random() > 0.6 ? 1 : 0;
          if (Math.random() > 0.9) hasResource = 'fiber';
        }

        // Create natural water bodies and rivers
        if (distanceFromCenter > GRID_SIZE * 0.45) {
          biome = 'water';
          height = -0.2;
          hasTree = false;
          hasRock = false;
          hasResource = undefined;
        }

        // Add some rivers
        const riverNoise = Math.abs(noise(x, z, 0.02));
        if (riverNoise < 0.1 && elevation > -0.2 && elevation < 0.3 && distanceFromCenter < GRID_SIZE * 0.4) {
          biome = 'water';
          height = Math.max(-0.1, elevation * 0.1);
          hasTree = false;
          hasRock = false;
          hasResource = undefined;
        }

        tiles.push({
          x: worldX,
          z: worldZ,
          biome,
          height,
          hasTree,
          hasRock,
          hasResource,
          fertility
        });
      }
    }
    
    return tiles;
  }, []);

  // Get biome materials with Albion-style colors
  const getBiomeMaterial = (biome: BiomeType, isHovered: boolean) => {
    const baseColors = {
      grass: isHovered ? "#90EE90" : "#4F7942",
      desert: isHovered ? "#F4E4BC" : "#D2B48C",
      water: isHovered ? "#87CEEB" : "#2E86AB",
      forest: isHovered ? "#32CD32" : "#1B4D3E",
      mountain: isHovered ? "#A9A9A9" : "#5D5D5D",
      snow: isHovered ? "#FFFAFA" : "#E6F3FF",
      swamp: isHovered ? "#8FBC8F" : "#556B2F",
      steppe: isHovered ? "#DAA520" : "#B8860B",
      highlands: isHovered ? "#9ACD32" : "#6B8E23"
    };

    if (biome === 'grass' || biome === 'forest' || biome === 'steppe' || biome === 'highlands') {
      return <meshLambertMaterial map={grassTexture} color={baseColors[biome]} />;
    } else if (biome === 'desert') {
      return <meshLambertMaterial map={sandTexture} color={baseColors[biome]} />;
    } else {
      return <meshLambertMaterial color={baseColors[biome]} />;
    }
  };

  // Resource node component
  const ResourceNode = ({ type, position }: { type: string; position: [number, number, number] }) => {
    const colors = {
      stone: "#8C8C8C",
      fiber: "#90EE90",
      wood: "#8B4513",
      ore: "#4A4A4A"
    };

    const geometries = {
      stone: <dodecahedronGeometry args={[0.15]} />,
      fiber: <coneGeometry args={[0.1, 0.3, 6]} />,
      wood: <cylinderGeometry args={[0.08, 0.12, 0.4, 8]} />,
      ore: <octahedronGeometry args={[0.12]} />
    };

    return (
      <mesh position={position} castShadow>
        {geometries[type as keyof typeof geometries]}
        <meshLambertMaterial color={colors[type as keyof typeof colors]} />
      </mesh>
    );
  };

  // Create terrain tiles with Albion-style details
  const tiles = terrainData.map((tile) => {
    const isHovered = hoveredTile && hoveredTile.x === tile.x && hoveredTile.z === tile.z;
    
    return (
      <group key={`tile-${tile.x}-${tile.z}`} position={[tile.x, tile.height, tile.z]}>
        {/* Base terrain tile with varied height */}
        <mesh 
          receiveShadow
          userData={{ gridX: tile.x, gridZ: tile.z, isGridTile: true }}
          onPointerMove={onPointerMove}
          onClick={onClick}
        >
          <boxGeometry args={[TILE_SIZE, Math.max(0.1, tile.height + 0.3), TILE_SIZE]} />
          {getBiomeMaterial(tile.biome, isHovered)}
        </mesh>
        
        {/* Tile border for hovered state */}
        {isHovered && (
          <mesh position={[0, (tile.height + 0.3) / 2 + 0.05, 0]}>
            <boxGeometry args={[TILE_SIZE + 0.04, 0.02, TILE_SIZE + 0.04]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.9} />
          </mesh>
        )}

        {/* Enhanced trees for different biomes */}
        {tile.hasTree && (
          <group position={[Math.random() * 0.4 - 0.2, (tile.height + 0.3) / 2, Math.random() * 0.4 - 0.2]}>
            {/* Tree trunk - varied by biome */}
            <mesh position={[0, 0.25, 0]} castShadow>
              <cylinderGeometry args={[0.04, 0.07, 0.5, 8]} />
              <meshLambertMaterial color={tile.biome === 'swamp' ? "#654321" : "#8B4513"} />
            </mesh>
            {/* Tree crown - varied by biome */}
            <mesh position={[0, 0.6, 0]} castShadow>
              {tile.biome === 'forest' || tile.biome === 'highlands' ? (
                <sphereGeometry args={[0.3, 8, 6]} />
              ) : (
                <coneGeometry args={[0.25, 0.6, 8]} />
              )}
              <meshLambertMaterial color={
                tile.biome === 'swamp' ? "#556B2F" :
                tile.biome === 'highlands' ? "#6B8E23" :
                "#228B22"
              } />
            </mesh>
          </group>
        )}

        {/* Enhanced rocks for mountain and highland biomes */}
        {tile.hasRock && (
          <mesh 
            position={[Math.random() * 0.3 - 0.15, (tile.height + 0.3) / 2 + 0.1, Math.random() * 0.3 - 0.15]} 
            castShadow
            rotation={[Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5]}
          >
            <dodecahedronGeometry args={[0.08 + Math.random() * 0.08]} />
            <meshLambertMaterial color={tile.biome === 'snow' ? "#E0E0E0" : "#696969"} />
          </mesh>
        )}

        {/* Resource nodes */}
        {tile.hasResource && (
          <ResourceNode 
            type={tile.hasResource} 
            position={[
              Math.random() * 0.3 - 0.15, 
              (tile.height + 0.3) / 2 + 0.15, 
              Math.random() * 0.3 - 0.15
            ]} 
          />
        )}

        {/* Fertility indicators for farming areas */}
        {tile.fertility > 0 && tile.biome === 'grass' && (
          <mesh position={[0, (tile.height + 0.3) / 2 + 0.02, 0]}>
            <ringGeometry args={[0.3, 0.35, 16]} />
            <meshBasicMaterial color="#90EE90" transparent opacity={0.3} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Water animation effect with waves */}
        {tile.biome === 'water' && (
          <>
            <mesh position={[0, (tile.height + 0.3) / 2 + 0.05, 0]}>
              <planeGeometry args={[TILE_SIZE * 0.95, TILE_SIZE * 0.95]} />
              <meshBasicMaterial 
                color="#4FC3F7" 
                transparent 
                opacity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
            {/* Wave effect */}
            <mesh position={[0, (tile.height + 0.3) / 2 + 0.08, 0]} rotation={[0, Math.PI * 0.25, 0]}>
              <planeGeometry args={[TILE_SIZE * 0.8, TILE_SIZE * 0.8]} />
              <meshBasicMaterial 
                color="#81D4FA" 
                transparent 
                opacity={0.4}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}

        {/* Swamp mist effect */}
        {tile.biome === 'swamp' && Math.random() > 0.8 && (
          <mesh position={[0, (tile.height + 0.3) / 2 + 0.3, 0]}>
            <sphereGeometry args={[0.2, 6, 4]} />
            <meshBasicMaterial color="#A0A0A0" transparent opacity={0.2} />
          </mesh>
        )}
      </group>
    );
  });

  return (
    <group ref={terrainRef}>
      {tiles}
    </group>
  );
};

export default Terrain;
