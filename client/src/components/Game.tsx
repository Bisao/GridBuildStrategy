import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import Grid from "./Grid";
import House from "./House";
import Enemy from "./Enemy";
import WolfSpawn from "./WolfSpawn";
import SkillEffect from "./SkillEffect";
import CameraControls from "./CameraControls";
import { useGridPlacement } from "../hooks/useGridPlacement";
import { useGameState } from "../lib/stores/useGameState";
import { useNPCControl } from "../hooks/useNPCControl";
import Windmill from "./structures/Windmill";
import Tower from "./structures/Tower";
import LargeHouse from "./structures/LargeHouse";
import Blacksmith from "./structures/Blacksmith";
import Market from "./structures/Market";
import { useAudio } from "../lib/stores/useAudio";
import Skybox from "./Skybox";
import NPCVariation from "./NPCVariations";
import FBXNPCModel from "./FBXNPCModel";

interface ActiveEffect {
  id: string;
  position: THREE.Vector3;
  skillType: string;
  startTime: number;
  duration: number;
}

interface CreatedNPC {
  id: string;
  name: string;
  structureId: string;
  position: { x: number; y: number; z: number };
  type: "villager" | "guard" | "merchant" | "farmer";
  class: "barbarian" | "knight" | "mage" | "rogue" | "rogue_hooded";
  rotation: number;
  animation: "idle" | "walk";
  health: number;
  maxHealth: number;
}

const Game = () => {
  const { camera, gl } = useThree();
  const [mousePosition, setMousePosition] = useState(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<{ x: number; z: number; id: string } | null>(null);
  const [isNPCPanelOpen, setNPCPanelOpen] = useState(false);

  const { 
    selectedStructure, 
    structures, 
    addStructure, 
    setSelectedStructure,
    createdNPCs,
    addNPC,
    enemies,
    spawnEnemy,
    wolfSpawns,
    addWolfSpawn,
    spawnWolfAtSpawn,
    controlledNPCId,
    setControlledNPCId,
    viewingNPCId,
    setViewingNPCId,
    removeEnemy
  } = useGameState();
  const { isControlling } = useNPCControl();

  // Handle enemy destruction and respawning
  const handleEnemyDestroy = (enemyId: string, spawnId?: string) => {
    // Remove the enemy
    useGameState.setState((state) => ({
      enemies: state.enemies.filter(enemy => enemy.id !== enemyId)
    }));

    // Schedule respawn if it came from a spawn point
    if (spawnId) {
      setTimeout(() => {
        spawnWolfAtSpawn(spawnId);
      }, 30000); // 30 seconds
    }
  };
  const { 
    placedStructures, 
    hoveredTile, 
    previewPosition,
    previewRotation,
    handleGridClick,
    handleGridHover,
    canPlaceStructure,
    rotatePreview
  } = useGridPlacement();

  // Criar spawn de lobo automaticamente quando não houver spawns
  useEffect(() => {
    if (wolfSpawns.length === 0) {
      // Criar spawns em posições estratégicas do grid
      const spawnPositions = [
        { x: -8, z: -8 },
        { x: 8, z: -8 },
        { x: -8, z: 8 },
        { x: 8, z: 8 },
        { x: 0, z: -9 },
        { x: 0, z: 9 }
      ];

      spawnPositions.forEach(position => {
        addWolfSpawn(position);
      });
    }
  }, [wolfSpawns.length, addWolfSpawn]);

  // Handle keyboard input for rotation and escape
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Stop NPC control first
        if (controlledNPCId) {
          setControlledNPCId(null);
        }
        // Stop NPC viewing
        else if (viewingNPCId) {
          setViewingNPCId(null);
        }
        // Cancel structure selection
        else if (selectedStructure) {
          setSelectedStructure(null);
        }
        // Close NPC panel
        else {
          setNPCPanelOpen(false);
        }
      } else if (selectedStructure && event.key.toLowerCase() === 'r') {
        rotatePreview();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedStructure, rotatePreview, setSelectedStructure, setNPCPanelOpen, controlledNPCId, viewingNPCId, setControlledNPCId, setViewingNPCId]);

  // Handle mouse movement for preview positioning
  useFrame(() => {
    if (selectedStructure) {
      raycaster.current.setFromCamera(mousePosition, camera);
      handleGridHover(raycaster.current);
    }
  });

  const handlePointerMove = (event: any) => {
    const rect = gl.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    setMousePosition(new THREE.Vector2(x, y));
  };

  const handleClick = (event: any) => {
    if (!event.object?.userData?.isGridTile) return;

    const { gridX, gridZ } = event.object.userData;

    // Right click to create wolf spawn
    if (event.nativeEvent.button === 2) {
      event.stopPropagation();
      addWolfSpawn({ x: gridX, z: gridZ });
      return;
    }

    if (selectedStructure) {
      const position = { x: gridX, z: gridZ };
      addStructure(selectedStructure, position);
      setSelectedStructure(null);
    }
  };

  const handleStructureClick = (position: { x: number; z: number }) => {
    // Encontrar a estrutura nas estruturas colocadas para obter o ID
    const structureClicked = placedStructures.find(
      structure => 
        structure.x === position.x && 
        structure.z === position.z
    );

    if (structureClicked) {
      setSelectedHouse({ x: position.x, z: position.z, id: structureClicked.id });
      setNPCPanelOpen(true);
    }
  };

  const getDurationForSkill = (skillType: string): number => {
    switch (skillType) {
      case "fireball":
        return 1500;
      case "ice_storm":
        return 2500;
      default:
        return 2000;
    }
  };

  useEffect(() => {
    // Expose effect creation function globally
    (window as any).createSkillEffect = (position: THREE.Vector3, skillType: string) => {
      const effectId = `effect_${Date.now()}_${Math.random()}`;
      const duration = getDurationForSkill(skillType);

      setActiveEffects(prev => [...prev, {
        id: effectId,
        position: position.clone(),
        skillType,
        startTime: Date.now(),
        duration
      }]);

      // Auto-remove effect after duration
      setTimeout(() => {
        removeEffect(effectId);
      }, duration);
    };

    return () => {
      delete (window as any).createSkillEffect;
    };
  }, []);

  const removeEffect = (effectId: string) => {
    setActiveEffects(prev => prev.filter(effect => effect.id !== effectId));
  };

  const handleCreateNPC = (name: string, structureId: string, type: "villager" | "guard" | "merchant" | "farmer" = "villager") => {
    const structure = placedStructures.find(s => s.id === structureId);
    if (!structure) return;

    // Generate random position around the structure
    const randomOffset = () => (Math.random() - 0.5) * 2;
    const position = {
      x: structure.position.x + randomOffset(),
      z: structure.position.z + randomOffset()
    };

    const newNPC: CreatedNPC = {
      id: `npc-${Date.now()}-${Math.random()}`,
      name,
      structureId,
      position,
      type,
      rotation: Math.random() * Math.PI * 2
    };

    addNPC(newNPC);
    console.log('NPC criado:', newNPC);
  };

  return (
    <>
      {/* Fantasy Skybox */}
      <Skybox />

      {/* Midday Lighting Setup */}
      <ambientLight intensity={0.8} color="#E6F3FF" />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.2} 
        color="#FFFACD"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight 
        position={[-5, 15, -5]} 
        intensity={0.4} 
        color="#87CEEB"
      />

      {/* Camera Controls */}
      <CameraControls />

      {/* Grid */}
      <Grid 
        onPointerMove={handlePointerMove}
        onClick={handleClick}
        hoveredTile={hoveredTile}
      />

      {/* Placed Structures */}
      {placedStructures.map((structure) => (
        <group 
          key={structure.id}
          position={[structure.x, 0, structure.z]}
          rotation={[0, (structure.rotation * Math.PI) / 180, 0]}
        >
          {structure.type === 'house' && (
            <House 
              position={{ x: structure.x, z: structure.z }}
              onStructureClick={handleStructureClick}
            />
          )}
          {structure.type === 'windmill' && (
            <Windmill 
              position={{ x: structure.x, z: structure.z }}
              onStructureClick={handleStructureClick}
            />
          )}
          {structure.type === 'tower' && (
            <Tower 
              position={{ x: structure.x, z: structure.z }}
              onStructureClick={handleStructureClick}
            />
          )}
          {structure.type === 'largehouse' && (
            <LargeHouse 
              position={{ x: structure.x, z: structure.z }}
              onStructureClick={handleStructureClick}
            />
          )}
          {structure.type === 'blacksmith' && (
            <Blacksmith 
              position={{ x: structure.x, z: structure.z }}
              onStructureClick={handleStructureClick}
            />
          )}
          {structure.type === 'market' && (
            <Market 
              position={{ x: structure.x, z: structure.z }}
              onStructureClick={handleStructureClick}
            />
          )}
        </group>
      ))}

      {/* Preview Structure */}
      {selectedStructure && previewPosition && (
        <group 
          position={[previewPosition.x, 0, previewPosition.z]}
          rotation={[0, (previewRotation * Math.PI) / 180, 0]}
        >
          {selectedStructure === 'house' && (
            <House 
              isPreview={true} 
              canPlace={canPlaceStructure(previewPosition.x, previewPosition.z)}
            />
          )}
          {selectedStructure === 'windmill' && (
            <Windmill 
              isPreview={true} 
              canPlace={canPlaceStructure(previewPosition.x, previewPosition.z)}
            />
          )}
          {selectedStructure === 'tower' && (
            <Tower 
              isPreview={true} 
              canPlace={canPlaceStructure(previewPosition.x, previewPosition.z)}
            />
          )}
          {selectedStructure === 'largehouse' && (
            <LargeHouse 
              isPreview={true} 
              canPlace={canPlaceStructure(previewPosition.x, previewPosition.z)}
            />
          )}
          {selectedStructure === 'blacksmith' && (
            <Blacksmith 
              isPreview={true} 
              canPlace={canPlaceStructure(previewPosition.x, previewPosition.z)}
            />
          )}
          {selectedStructure === 'market' && (
            <Market 
              isPreview={true} 
              canPlace={canPlaceStructure(previewPosition.x, previewPosition.z)}
            />
          )}
        </group>
      )}

      {/* Render NPCs */}
        {createdNPCs.map((npc) => (
          <group key={npc.id}>
            {/* Use FBX model for NPCs with direct position */}
            <FBXNPCModel
              position={[npc.position.x, npc.position.y, npc.position.z]}
              type={npc.class as "barbarian" | "knight" | "mage" | "rogue" | "rogue_hooded"}
              animation={npc.animation as "idle" | "walk"}
              rotation={npc.rotation}
            />

            {/* NPC Name Tag */}
            <Html
              position={[npc.position.x, npc.position.y + 2.2, npc.position.z]}
              center
              distanceFactor={8}
              occlude={false}
            >
              <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none">
                {npc.name}
                {controlledNPCId === npc.id && " (Controlled)"}
                {viewingNPCId === npc.id && " (Viewing)"}
              </div>
            </Html>

            {/* Health bar */}
            {npc.health < npc.maxHealth && (
              <Html
                position={[npc.position.x, npc.position.y + 2.5, npc.position.z]}
                center
                distanceFactor={8}
                occlude={false}
              >
                <div className="w-16 h-1 bg-red-600 rounded overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${(npc.health / npc.maxHealth) * 100}%` }}
                  />
                </div>
              </Html>
            )}
          </group>
        ))}

      {/* Enemies */}
      {enemies.map((enemy) => {
        // Find the spawn that created this enemy based on position
        const spawn = wolfSpawns.find(s => 
          Math.abs(s.position.x - enemy.position.x) < 0.1 && 
          Math.abs(s.position.z - enemy.position.z) < 0.1
        );

        return (
          <Enemy
            key={enemy.id}
            id={enemy.id}
            position={enemy.position}
            spawnId={spawn?.id}
            onDestroy={handleEnemyDestroy}
          />
        );
      })}

            {/* Skill Effects */}
        {activeEffects.map(effect => (
          <SkillEffect
            key={effect.id}
            position={effect.position}
            skillType={effect.skillType}
            startTime={effect.startTime}
            duration={effect.duration}
            onComplete={() => removeEffect(effect.id)}
          />
        ))}
      {/* Wolf Spawns */}
      {wolfSpawns.map((spawn) => (
        <WolfSpawn
          key={spawn.id}
          id={spawn.id}
          position={spawn.position}
        />
      ))}
    </>
  );
};

export default Game;