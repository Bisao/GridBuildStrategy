
import { useGameState } from "../lib/stores/useGameState";

export default function CombatIndicator() {
  const { controlledNPCId, createdNPCs } = useGameState();

  if (!controlledNPCId) return null;

  const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
  if (!controlledNPC || controlledNPC.isDead) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-600/90 text-white px-4 py-3 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-3">
        <span className="text-lg">⚔️</span>
        <div>
          <div className="font-medium">{controlledNPC.name}</div>
          <div className="text-sm">
            HP: {controlledNPC.hp}/{controlledNPC.maxHp}
          </div>
          <div className="text-xs opacity-75 mt-1">
            Clique direito para atacar NPCs próximos
          </div>
        </div>
        
        {/* HP Bar */}
        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500 transition-all duration-300"
            style={{ 
              width: `${((controlledNPC.hp || 0) / (controlledNPC.maxHp || 100)) * 100}%`,
              backgroundColor: (controlledNPC.hp || 0) > (controlledNPC.maxHp || 100) * 0.5 ? '#4CAF50' : 
                              (controlledNPC.hp || 0) > (controlledNPC.maxHp || 100) * 0.25 ? '#FFC107' : '#F44336'
            }}
          />
        </div>
      </div>
    </div>
  );
}
