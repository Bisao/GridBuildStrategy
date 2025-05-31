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
import SaveLoadPanel from "./components/SaveLoadPanel";
import { useGameState } from "./lib/stores/useGameState";

import SkillsBar from "./components/SkillsBar";

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

  const [isMobile, setIsMobile] = useState(false);
  const { placedStructures } = useGridPlacement();
  const { autoSave, autoSaveEnabled, createdNPCs } = useGameState();

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
            antialias: !isMobile,
            powerPreference: isMobile ? "default" : "high-performance",
            pixelRatio: Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2),
          }}
        >
          <color attach="background" args={["#1a1a2e"]} />

          {/* Lighting setup */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
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

      {/* Skills Bar */}
      <SkillsBar />
      </div>
    </QueryClientProvider>
  );
}

export default App;