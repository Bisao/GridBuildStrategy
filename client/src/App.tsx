import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@fontsource/inter";
import "./index.css";
import Game from "./components/Game";
import StructurePanel from "./components/StructurePanel";
import NPCPanel from "./components/NPCPanel";
import { useGameState } from "./lib/stores/useGameState";

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
    createdNPCs
  } = useGameState();

  const [isMobile, setIsMobile] = useState(false);

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
    
    useGameState.getState().addNPC(newNPC);
    setNPCPanelOpen(false);
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
          onSelectStructure={setSelectedStructure}
          isOpen={isStructurePanelOpen}
          onToggle={() => setStructurePanelOpen(!isStructurePanelOpen)}
        />
        
        <NPCPanel
          isOpen={isNPCPanelOpen}
          housePosition={selectedHouse}
          onClose={() => setNPCPanelOpen(false)}
          onCreateNPC={handleCreateNPC}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;
