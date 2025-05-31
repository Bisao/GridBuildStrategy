import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface CreatedNPC {
  id: string;
  name: string;
  structureId: string;
  position: { x: number; z: number };
  type: "villager" | "guard" | "merchant" | "farmer";
}

interface GameState {
  selectedStructure: string | null;
  isPlacementMode: boolean;
  selectedHouse: { x: number; z: number; id: string } | null;
  isNPCPanelOpen: boolean;
  isNPCCreationOpen: boolean;
  isStructurePanelOpen: boolean;
  createdNPCs: CreatedNPC[];
  
  // Actions
  setSelectedStructure: (structure: string | null) => void;
  setPlacementMode: (mode: boolean) => void;
  setSelectedHouse: (house: { x: number; z: number; id: string } | null) => void;
  setNPCPanelOpen: (open: boolean) => void;
  setNPCCreationOpen: (open: boolean) => void;
  setStructurePanelOpen: (open: boolean) => void;
  addNPC: (npc: CreatedNPC) => void;
  removeNPC: (npcId: string) => void;
  getNPCsByStructure: (structureId: string) => CreatedNPC[];
}

export const useGameState = create<GameState>()(
  subscribeWithSelector((set, get) => ({
    selectedStructure: null,
    isPlacementMode: false,
    selectedHouse: null,
    isNPCPanelOpen: false,
    isNPCCreationOpen: false,
    isStructurePanelOpen: true,
    createdNPCs: [],
    
    setSelectedStructure: (structure) => {
      set({ 
        selectedStructure: structure,
        isPlacementMode: structure !== null 
      });
      console.log(`Selected structure: ${structure || 'none'}`);
    },
    
    setPlacementMode: (mode) => {
      set({ isPlacementMode: mode });
      if (!mode) {
        set({ selectedStructure: null });
      }
    },
    
    setSelectedHouse: (house) => {
      set({ selectedHouse: house });
      console.log(`Selected house: ${house ? `(${house.x}, ${house.z}) ID: ${house.id}` : 'none'}`);
    },
    
    setNPCPanelOpen: (open) => {
      set({ isNPCPanelOpen: open });
      if (!open) {
        set({ selectedHouse: null, isNPCCreationOpen: false });
      }
    },
    
    setStructurePanelOpen: (open) => {
      set({ isStructurePanelOpen: open });
    },

    setNPCCreationOpen: (open) => {
      set({ isNPCCreationOpen: open });
    },

    addNPC: (npc) => {
      set((state) => ({
        createdNPCs: [...state.createdNPCs, npc]
      }));
      console.log(`NPC "${npc.name}" criado com sucesso na estrutura ${npc.structureId}`);
    },

    removeNPC: (npcId) => {
      set((state) => ({
        createdNPCs: state.createdNPCs.filter(npc => npc.id !== npcId)
      }));
    },

    getNPCsByStructure: (structureId) => {
      return get().createdNPCs.filter(npc => npc.structureId === structureId);
    }
  }))
);
