import React from 'react';
import { useGameState } from '../lib/stores/useGameState';
import HUDIcons from './HUDIcons';

interface GameHUDProps {
  onOpenCombatPanel?: () => void;
  onOpenStructurePanel?: () => void;
}

export default function GameHUD({ onOpenCombatPanel, onOpenStructurePanel }: GameHUDProps) {
  const { controlledNPCId, createdNPCs } = useGameState();

  const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
  const playerName = controlledNPC?.name || "Player";

  // Get real NPC stats
  const health = controlledNPC?.health || 100;
  const maxHealth = controlledNPC?.maxHealth || 100;
  const energy = controlledNPC?.mana || 100;
  const maxEnergy = controlledNPC?.maxMana || 100;

  const isDead = health <= 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {/* Top Left - Player Info (only when controlling NPC) */}
      {controlledNPCId && (
        <div className="absolute top-4 left-4 pointer-events-auto">
          <div className="flex items-center gap-3 bg-black/70 rounded-lg p-3 border border-yellow-600/50">
            {/* Player Avatar */}
            <div className="w-12 h-12 rounded-full border-2 border-yellow-500 bg-gradient-to-br from-yellow-600 to-orange-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">🧙</span>
            </div>

            {/* Player Stats */}
            <div className="text-white">
              <div className="font-bold text-yellow-400 text-sm">{playerName}</div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-red-400">❤️ {health}/{maxHealth}</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-blue-400">⚡ {energy}/{maxEnergy}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Right - Interface Icons */}
      <HUDIcons 
        onOpenCombatPanel={onOpenCombatPanel || (() => {})}
        onOpenStructurePanel={onOpenStructurePanel || (() => {})}
      />



      {/* Bottom Right - Server Info */}
      <div className="absolute bottom-4 right-4 pointer-events-auto space-y-2">
        {/* Bioma e Posição */}
        <div className="bg-black/70 border border-yellow-600/50 rounded p-2 text-white text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-green-400">🌱</span>
              <span>Planície Verde</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400">📍</span>
              <span>X: {controlledNPC?.position.x.toFixed(1) || '0.0'}, Z: {controlledNPC?.position.z.toFixed(1) || '0.0'}</span>
            </div>
          </div>
        </div>

        {/* Server Info */}
        <div className="bg-black/70 border border-yellow-600/50 rounded p-2 text-white text-xs">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">🌐</span>
            <span>Stinktions</span>
            <span className="text-gray-400">17/22</span>
          </div>
        </div>
      </div>

      {/* Left Side - Additional UI */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-auto">
        <div className="flex flex-col gap-2">
          <button className="w-10 h-10 bg-black/70 border border-yellow-600/50 rounded flex items-center justify-center text-white hover:bg-black/90">
            <span className="text-sm">📍</span>
          </button>
        </div>
      </div>

      {/* Target UI (when targeting something and controlling NPC) */}
      {controlledNPCId && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-black/80 border border-yellow-600 rounded-lg p-2 min-w-32">
            <div className="text-center">
              <div className="text-yellow-400 font-bold text-sm">🏰 Dirt</div>
              <div className="w-full bg-gray-700 rounded h-2 mt-1">
                <div className="bg-yellow-500 h-2 rounded" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}