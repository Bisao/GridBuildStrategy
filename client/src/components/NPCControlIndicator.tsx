
import { useGameState } from "../lib/stores/useGameState";

export default function NPCControlIndicator() {
  const { controlledNPCId, createdNPCs, setControlledNPCId } = useGameState();

  if (!controlledNPCId) return null;

  const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600/90 text-white px-3 py-2 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-2">
        <span className="text-lg">🕹️</span>
        <span className="font-medium">
          Controlando: {controlledNPC?.name || 'NPC'}
        </span>
        <span className="text-sm opacity-75">
          (WASD: mover, Botão direito: atacar, ESC: parar)
        </span>
        <button
          onClick={() => setControlledNPCId(null)}
          className="ml-2 text-lg hover:bg-white/20 rounded px-1"
          title="Parar controle"
        >
          ❌
        </button>
      </div>
    </div>
  );
}
