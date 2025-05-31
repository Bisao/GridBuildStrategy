import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

interface CreatedNPC {
  id: string;
  name: string;
  structureId: string;
  position: { x: number; z: number };
  type: "villager" | "guard" | "merchant" | "farmer";
  rotation?: number;
  animation?: "idle" | "walk" | "attack" | "hurt" | "death";
  hp?: number;
  maxHp?: number;
  isInCombat?: boolean;
  isDead?: boolean;
}

interface GameState {
  selectedStructure: string | null;
  isPlacementMode: boolean;
  selectedHouse: { x: number; z: number; id: string } | null;
  isNPCPanelOpen: boolean;
  isNPCCreationOpen: boolean;
  isStructurePanelOpen: boolean;
  isNPCConfigPanelOpen: boolean;
  selectedNPCId: string | null;
  controlledNPCId: string | null;
  viewingNPCId: string | null;
  createdNPCs: CreatedNPC[];

  // Actions
  setSelectedStructure: (structure: string | null) => void;
  setPlacementMode: (mode: boolean) => void;
  setSelectedHouse: (house: { x: number; z: number; id: string } | null) => void;
  setNPCPanelOpen: (open: boolean) => void;
  setNPCCreationOpen: (open: boolean) => void;
  setStructurePanelOpen: (open: boolean) => void;
  setNPCConfigPanelOpen: (open: boolean) => void;
  setSelectedNPCId: (npcId: string | null) => void;
  setControlledNPCId: (npcId: string | null) => void;
  setViewingNPCId: (npcId: string | null) => void;
  addNPC: (npc: CreatedNPC) => void;
  updateNPC: (npcId: string, updates: Partial<CreatedNPC>) => void;
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
    isNPCConfigPanelOpen: false,
    selectedNPCId: null,
    controlledNPCId: null,
    viewingNPCId: null,
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
    setNPCConfigPanelOpen: (open) => set({ isNPCConfigPanelOpen: open }),
    setSelectedNPCId: (npcId) => set({ selectedNPCId: npcId }),
    setControlledNPCId: (npcId) => {
      set({ controlledNPCId: npcId });
      console.log(`NPC control set to: ${npcId || 'none'}`);
    },

    setViewingNPCId: (npcId) => {
      set({ viewingNPCId: npcId });
      console.log(`NPC viewing set to: ${npcId || 'none'}`);
    },

    addNPC: (npc) => {
      const maxHp = npc.type === "guard" ? 150 : 100;
      set((state) => ({
        createdNPCs: [...state.createdNPCs, { 
          ...npc, 
          animation: npc.animation || "idle",
          hp: maxHp,
          maxHp: maxHp,
          isInCombat: false,
          isDead: false
        }]
      }));
      console.log(`NPC "${npc.name}" criado com sucesso na estrutura ${npc.structureId}`);
    },

    updateNPC: (npcId, updates) => {
      set((state) => ({
        createdNPCs: state.createdNPCs.map(npc => 
          npc.id === npcId 
            ? { ...npc, ...updates }
            : npc
        )
      }));
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