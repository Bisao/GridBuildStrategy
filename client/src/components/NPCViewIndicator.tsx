
import { useGameState } from "../lib/stores/useGameState";

export default function NPCViewIndicator() {
  const { viewingNPCId, createdNPCs, setViewingNPCId } = useGameState();

  if (!viewingNPCId) return null;

  const viewedNPC = createdNPCs.find(npc => npc.id === viewingNPCId);

  return (
    <div className="fixed bottom-4 right-4 bg-blue-600/90 text-white px-3 py-2 rounded-lg shadow-lg z-50"></div>
      <div className="flex items-center gap-2">
        <span className="text-lg">👁️</span>
        <span className="font-medium">
          Visualizando: {viewedNPC?.name || 'NPC'}
        </span>
        <span className="text-sm opacity-75">
          (ESC para parar)
        </span>
        <button
          onClick={() => setViewingNPCId(null)}
          className="ml-2 text-lg hover:bg-white/20 rounded px-1"
          title="Parar visualização"
        >
          ❌
        </button>
      </div>
    </div>
  );
}
