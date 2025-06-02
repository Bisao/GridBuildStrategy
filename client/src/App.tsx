import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/inter";
import "./index.css";
import Game from "./components/Game";
import { useGridPlacement } from "./hooks/useGridPlacement";
import StructurePanel from "./components/StructurePanel";
import NPCPanel from "./components/NPCPanel";
import NPCConfigPanel from "./components/NPCConfigPanel";
import NPCControlIndicator from "./components/NPCControlIndicator";
import NPCViewIndicator from "./components/NPCViewIndicator";
import CombatTestPanel from "./components/CombatTestPanel";
import SaveLoadPanel from "./components/SaveLoadPanel";
import { useGameState } from "./lib/stores/useGameState";
import { useCombatState } from "./lib/stores/useCombatState";

import PlayerHUD from "./components/PlayerHUD"; // Import PlayerHUD
import GameHUD from './components/GameHUD';
import SkillsBar from './components/SkillsBar';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
  },
});

function App() {
  const { 
    selectedStructure, 
    setSelectedStructure, 
    selectedHouse, 
    isNPCPanelOpen, 
    setNPCPanelOpen,
    isStructurePanelOpen,
    setStructurePanelOpen,
    addNPC
  } = useGameState();

  const [isNPCConfigPanelOpen, setNPCConfigPanelOpen] = useState(false);
  const [selectedNPC, setSelectedNPC] = useState<string | null>(null);
  const [isSaveLoadPanelOpen, setIsSaveLoadPanelOpen] = useState(false);
  const [isCombatTestPanelOpen, setCombatTestPanelOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const { placedStructures } = useGridPlacement();
  const { autoSave, autoSaveEnabled, createdNPCs } = useGameState();
  const { updatePlayerStats, playerStats } = useCombatState();

  // Periodic auto-save every 2 minutes
  useEffect(() => {
    if (!autoSaveEnabled) return;

    const autoSaveInterval = setInterval(() => {
      if (placedStructures.length > 0 || createdNPCs.length > 0) {
        autoSave(placedStructures).catch(error => {
          console.error('Erro no auto-save periódico:', error);
        });
      }
    }, 120000); // 2 minutes

    return () => clearInterval(autoSaveInterval);
  }, [autoSave, autoSaveEnabled, placedStructures, createdNPCs]);

  // Mana regeneration system
  useEffect(() => {
    const manaRegenInterval = setInterval(() => {
      if (playerStats.mana < playerStats.maxMana) {
        updatePlayerStats({
          mana: Math.min(playerStats.maxMana, playerStats.mana + 2)
        });
      }
    }, 1000); // Regenerate 2 mana per second

    return () => clearInterval(manaRegenInterval);
  }, [playerStats.mana, playerStats.maxMana, updatePlayerStats]);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleCreateNPC = (name: string, structureId: string) => {
    if (!selectedHouse) return;

    const newNPC = {
      id: `npc-${Date.now()}-${Math.random()}`,
      name,
      structureId,
      position: { x: selectedHouse.x, z: selectedHouse.z },
      type: "villager" as const
    };

    console.log(`Criando NPC "${name}" vinculado à estrutura ${structureId} na posição (${selectedHouse.x}, ${selectedHouse.z})`);
    addNPC(newNPC);
    setNPCPanelOpen(false);
  };

  const handleConfigureNPC = (npcId: string) => {
    setSelectedNPC(npcId);
    setNPCConfigPanelOpen(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-screen relative bg-gray-900">
        <Canvas
          shadows
          camera={{
            position: isMobile ? [8, 6, 8] : [10, 8, 10],
            fov: isMobile ? 70 : 60,
            near: 0.1,
            far: 1000,
          }}
          gl={{
            antialias: false,
            powerPreference: "default",
            pixelRatio: Math.min(window.devicePixelRatio, 1.5),
            preserveDrawingBuffer: false,
            alpha: false,
          }}
        >
          <color attach="background" args={["#1a1a2e"]} />

          {/* Lighting setup */}
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[15, 15, 10]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={80}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
          />
          {/* Additional atmospheric lighting */}
          <directionalLight
            position={[-5, 8, -5]}
            intensity={0.3}
            color="#87CEEB"
          />

          <Suspense fallback={null}>
            <Game />
          </Suspense>
        </Canvas>



        {/* UI overlay outside of Canvas */}
        <StructurePanel
          selectedStructure={selectedStructure}
          isOpen={isStructurePanelOpen}
          onClose={() => setStructurePanelOpen(false)}
          onSelectStructure={setSelectedStructure}
          onOpenSaveLoad={() => setIsSaveLoadPanelOpen(true)}
        />

        <CombatTestPanel
          isOpen={isCombatTestPanelOpen}
          onClose={() => setCombatTestPanelOpen(false)}
        />

        <SaveLoadPanel
          isOpen={isSaveLoadPanelOpen}
          onClose={() => setIsSaveLoadPanelOpen(false)}
          structures={placedStructures}
        />

        <NPCPanel
          isOpen={isNPCPanelOpen}
          housePosition={selectedHouse}
          onClose={() => setNPCPanelOpen(false)}
          onCreateNPC={handleCreateNPC}
          onConfigureNPC={handleConfigureNPC}
        />
         {/* NPC Config Panel */}
      <NPCConfigPanel
        isOpen={isNPCConfigPanelOpen}
        npcId={selectedNPC}
        onClose={() => {
          setNPCConfigPanelOpen(false);
          setSelectedNPC(null);
        }}
      />

      <NPCViewIndicator />
        <NPCControlIndicator />

        <CombatTestPanel
          isOpen={isCombatTestPanelOpen}
          onClose={() => setCombatTestPanelOpen(false)}
        />

        {/* Albion HUD */}
        <GameHUD 
          onOpenCombatPanel={() => setCombatTestPanelOpen(true)}
          onOpenStructurePanel={() => setStructurePanelOpen(true)}
        />

        <SkillsBar />

        <Toaster position="top-center" />
        <PlayerHUD />
      </div>
    </QueryClientProvider>
  );
}

export default App;