
import React from 'react';
import { useGameState } from '../lib/stores/useGameState';
import { useSkills } from '../lib/stores/useSkills';

export default function AlbionHUD() {
  const { controlledNPCId, createdNPCs } = useGameState();
  const { skills, mana, maxMana } = useSkills();

  if (!controlledNPCId) {
    return null;
  }

  const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
  const playerName = controlledNPC?.name || "Player";

  // Mock values for demonstration
  const health = 1374;
  const maxHealth = 1374;
  const energy = 147;
  const maxEnergy = 147;

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {/* Top Left - Player Info */}
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

      {/* Top Right - Resource Icons */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div className="flex gap-2">
          {/* Resource Icons Row 1 */}
          <div className="flex gap-1">
            {['🍞', '🥤', '🏺', '❤️', '🛡️', '⚔️'].map((icon, index) => (
              <div key={index} className="w-8 h-8 bg-black/70 border border-yellow-600/50 rounded-md flex items-center justify-center">
                <span className="text-sm">{icon}</span>
                <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Resource Icons Row 2 */}
        <div className="flex gap-1 mt-2 justify-end">
          {['🎯', '👥', '🗺️'].map((icon, index) => (
            <div key={index} className="w-8 h-8 bg-black/70 border border-yellow-600/50 rounded-md flex items-center justify-center">
              <span className="text-sm">{icon}</span>
            </div>
          ))}
        </div>

        {/* Additional Icons */}
        <div className="flex gap-1 mt-2 justify-end">
          {['💰', '📊'].map((icon, index) => (
            <div key={index} className="w-8 h-8 bg-black/70 border border-yellow-600/50 rounded-md flex items-center justify-center">
              <span className="text-sm">{icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Center - Skills Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="flex items-center gap-4">
          
          {/* Health Orb */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-900 via-red-700 to-red-500 border-4 border-red-800 shadow-2xl relative overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-400 to-red-300 transition-all duration-500"
                style={{ height: `${(health / maxHealth) * 100}%` }}
              />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-red-200/20 via-transparent to-transparent" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold text-xs">
              <span className="text-sm">{health}</span>
              <span className="text-xs opacity-80">{maxHealth}</span>
            </div>
          </div>

          {/* Skills Panel */}
          <div className="bg-black/80 border-2 border-yellow-600/70 rounded-lg p-2">
            <div className="flex gap-1">
              {skills.slice(0, 10).map((skill, index) => {
                const isOnCooldown = skill.currentCooldown > 0;
                const hasInsufficientMana = mana < skill.manaCost;
                const isDisabled = isOnCooldown || hasInsufficientMana;
                
                return (
                  <div key={skill.id} className="relative">
                    <button
                      className={`
                        w-12 h-12 rounded-full border-2 transition-all duration-200 relative overflow-hidden
                        ${isDisabled 
                          ? 'border-gray-600 bg-gray-800/80 opacity-60' 
                          : 'border-yellow-500/70 bg-gradient-to-br from-gray-700 to-gray-800 hover:border-yellow-400'
                        }
                      `}
                      disabled={isDisabled}
                    >
                      <div className="text-lg">{skill.icon}</div>
                      
                      {/* Cooldown overlay */}
                      {isOnCooldown && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                          <span className="text-xs text-white font-bold">
                            {Math.ceil(skill.currentCooldown)}
                          </span>
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mana Orb */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 border-4 border-blue-800 shadow-2xl relative overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-300 transition-all duration-500"
                style={{ height: `${(mana / maxMana) * 100}%` }}
              />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-200/20 via-transparent to-transparent" />
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold text-xs">
              <span className="text-sm">{Math.floor(mana)}</span>
              <span className="text-xs opacity-80">{maxMana}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right - Server Info */}
      <div className="absolute bottom-4 right-4 pointer-events-auto">
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

      {/* Target UI (when targeting something) */}
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
    </div>
  );
}
