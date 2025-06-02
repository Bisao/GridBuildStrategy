import { useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import Grid from "./Grid";
import House from "./House";
import NPC from "./NPC";
import Enemy from "./Enemy";
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

interface ActiveEffect {
  id: string;
  position: THREE.Vector3;
  skillType: string;
  startTime: number;
  duration: number;
}

const Game = () => {
  const { camera, gl } = useThree();
  const [mousePosition, setMousePosition] = useState(new THREE.Vector2());
  const raycaster = useRef(new THREE.Raycaster());
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);

  const { 
    selectedStructure, 
    setSelectedStructure, 
    setSelectedHouse, 
    setNPCPanelOpen,
    createdNPCs,
    enemies,
    controlledNPCId,
    setControlledNPCId,
    viewingNPCId,
    setViewingNPCId,
    removeEnemy
  } = useGameState();
  const { isControlling } = useNPCControl();
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
    if (selectedStructure) {
      event.stopPropagation();
      raycaster.current.setFromCamera(mousePosition, camera);
      const success = handleGridClick(raycaster.current, selectedStructure);
      if (success) {
        console.log("Structure placed successfully!");
      }
    }
    // NPC movement is handled in useNPCControl hook
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

  return (
    <>
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
        <NPC
          key={npc.id}
          id={npc.id}
          name={npc.name}
          position={[npc.position.x, 0, npc.position.z]}
          type={npc.type}
          rotation={npc.rotation}
          animation={npc.animation}
        />
      ))}

      {/* Render Enemies */}
      {enemies.map((enemy) => (
              <Enemy
                key={enemy.id}
                id={enemy.id}
                position={enemy.position}
                onDestroy={(id) => removeEnemy(id)}
              />
            ))}

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

    </>
  );
};

export default Game;