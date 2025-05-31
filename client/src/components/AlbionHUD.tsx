
import React from 'react';
import { useGameState } from '../lib/stores/useGameState';
import { useSkills } from '../lib/stores/useSkills';

export default function AlbionHUD() {
  const { controlledNPCId, createdNPCs } = useGameState();
  const { 
    skills, 
    mana, 
    maxMana, 
    useSkill, 
    updateCooldowns, 
    updateMana 
  } = useSkills();

  // Mock data for demonstration
  const health = 1209;
  const maxHealth = 1415;
  const energy = 147;
  const maxEnergy = 147;
  const manaValue = 856;
  const maxManaValue = 856;
  const food = 90;
  const maxFood = 90;

  const handleSkillClick = (skillId: string) => {
    if (!controlledNPCId) return;
    const skill = skills.find(s => s.id === skillId);
    if (!skill || skill.currentCooldown > 0 || mana < skill.manaCost) return;
    useSkill(skillId);
  };

  if (!controlledNPCId) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Top Left - Player Avatars */}
      <div className="absolute top-4 left-4 flex gap-3 pointer-events-auto">
        {/* Main Player */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-3 border-orange-400 bg-gradient-to-br from-orange-600 to-red-700 overflow-hidden">
            <img 
              src="https://via.placeholder.com/64x64/8B4513/FFFFFF?text=P1" 
              alt="Player"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 left-0 right-0 bg-black/80 text-white text-xs text-center py-1 rounded">
            Obiri
          </div>
          {/* Health/Energy bars */}
          <div className="absolute -right-20 top-0 space-y-1">
            <div className="w-16 h-2 bg-black/60 rounded-full">
              <div 
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${(health / maxHealth) * 100}%` }}
              />
            </div>
            <div className="w-16 h-2 bg-black/60 rounded-full">
              <div 
                className="h-full bg-yellow-500 rounded-full transition-all"
                style={{ width: `${(energy / maxEnergy) * 100}%` }}
              />
            </div>
          </div>
          <div className="absolute -right-24 -top-1 text-white text-xs">
            <div>{health}/{maxHealth}</div>
            <div>{energy}/{maxEnergy}</div>
          </div>
        </div>

        {/* Party Member */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-gray-400 bg-gradient-to-br from-gray-600 to-gray-800 overflow-hidden">
            <img 
              src="https://via.placeholder.com/48x48/4682B4/FFFFFF?text=GT" 
              alt="Giant Toad"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 left-0 right-0 bg-black/80 text-white text-xs text-center py-1 rounded">
            Giant Toad
          </div>
          <div className="absolute -right-16 top-0 space-y-1">
            <div className="w-12 h-1.5 bg-black/60 rounded-full">
              <div className="w-full h-full bg-red-500 rounded-full" />
            </div>
            <div className="w-12 h-1.5 bg-black/60 rounded-full">
              <div className="w-full h-full bg-blue-500 rounded-full" />
            </div>
          </div>
          <div className="absolute -right-20 -top-1 text-white text-xs">
            <div>{manaValue}/{maxManaValue}</div>
            <div>{food}/{maxFood}</div>
          </div>
        </div>
      </div>

      {/* Top Right - Inventory/Menu Icons */}
      <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
        {['🎒', '⚔️', '🛡️', '💍', '🏆', '📜', '⚙️', '💰', '🔔'].map((icon, index) => (
          <button
            key={index}
            className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-yellow-800 border-2 border-yellow-400 rounded-full flex items-center justify-center text-white hover:from-yellow-500 hover:to-yellow-700 transition-all shadow-lg"
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Center Bottom - Circular Hotbar */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto">
        <div className="relative w-80 h-20">
          {/* Curved hotbar background */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/40 rounded-full border-2 border-gray-600 shadow-2xl" />
          
          {/* Skills arranged in arc */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-1">
              {skills.slice(0, 8).map((skill, index) => {
                const isOnCooldown = skill.currentCooldown > 0;
                const hasInsufficientMana = mana < skill.manaCost;
                const isDisabled = isOnCooldown || hasInsufficientMana;
                
                return (
                  <button
                    key={skill.id}
                    onClick={() => handleSkillClick(skill.id)}
                    className={`
                      relative w-12 h-12 rounded-full border-2 transition-all duration-200 overflow-hidden
                      ${isDisabled 
                        ? 'border-gray-600 bg-gray-800/80 opacity-60' 
                        : 'border-yellow-500 bg-gradient-to-br from-gray-700 to-gray-900 hover:border-yellow-400 hover:scale-105'
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
                    
                    {/* Key binding */}
                    <div className="absolute -bottom-1 -right-1 bg-yellow-600 text-black text-xs w-4 h-4 flex items-center justify-center rounded-full border border-yellow-400 font-bold">
                      {index + 1}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Left - Chat */}
      <div className="absolute bottom-4 left-4 w-96 h-48 pointer-events-auto">
        <div className="bg-black/60 border border-gray-600 rounded-lg p-3 h-full">
          <div className="h-40 overflow-y-auto text-sm space-y-1">
            <div className="text-green-400">[17:16:24] [English] Kitcormic: bgg</div>
            <div className="text-yellow-400">[17:16:42] [English] Bedigo: lol</div>
            <div className="text-green-400">[17:16:42] [English] ShadOwG995: show me mon</div>
            <div className="text-green-400">[17:16:52] [English] ShadOwG995: shot once me</div>
            <div className="text-white">[17:15:08] [English] Bedigo: I spend 80k on worms (3</div>
            <div className="text-white">kill 31 jr journals</div>
            <div className="text-yellow-400">[17:15:16] [English] Merqulusanheart: i do that too</div>
            <div className="text-white">[17:15:42] [English] Stain51: ye sf god healer jaja</div>
          </div>
          <div className="mt-2">
            <input 
              type="text" 
              placeholder="Digite uma mensagem..."
              className="w-full bg-black/40 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-yellow-400"
            />
          </div>
        </div>
      </div>

      {/* Bottom Right - Quest/Activities Panel */}
      <div className="absolute bottom-4 right-4 w-80 pointer-events-auto">
        <div className="bg-black/80 border border-gray-600 rounded-lg p-3">
          <div className="space-y-3">
            {/* Journeyman Adventures */}
            <div className="flex items-center gap-3 bg-black/40 p-2 rounded">
              <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
                <span className="text-white text-xs">🗡️</span>
              </div>
              <div className="flex-1">
                <div className="text-orange-400 text-sm font-bold">Journeyman Adventures</div>
                <div className="text-gray-300 text-xs">237000/600</div>
                <div className="text-yellow-400 text-xs">+3%</div>
              </div>
            </div>

            {/* Journeyman Cloth Ar... */}
            <div className="flex items-center gap-3 bg-black/40 p-2 rounded">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-xs">👕</span>
              </div>
              <div className="flex-1">
                <div className="text-blue-400 text-sm font-bold">Journeyman Cloth Ar...</div>
                <div className="text-gray-300 text-xs">72465/000</div>
              </div>
            </div>

            {/* Journeyman Leather... */}
            <div className="flex items-center gap-3 bg-black/40 p-2 rounded">
              <div className="w-8 h-8 bg-brown-600 rounded flex items-center justify-center">
                <span className="text-white text-xs">🧥</span>
              </div>
              <div className="flex-1">
                <div className="text-yellow-400 text-sm font-bold">Journeyman Leather...</div>
                <div className="text-gray-300 text-xs">72465/000</div>
              </div>
            </div>

            {/* Bottom items */}
            <div className="border-t border-gray-600 pt-2 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-blue-400">📜</span>
                <span className="text-blue-400">Albion Journal</span>
                <span className="text-yellow-400 ml-auto">3/13</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-purple-400">⚡</span>
                <span className="text-white">PvE Activities - Expediti...</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-400">🌿</span>
                <span className="text-white">Gathering - Resources</span>
                <span className="text-gray-400 ml-auto">0/80</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-yellow-400">💰</span>
                <span className="text-white">Daily Bonus</span>
                <span className="text-yellow-400 ml-auto">197/1200</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Map Indicator (bottom right corner) */}
      <div className="absolute bottom-4 right-96 w-32 h-32 pointer-events-auto">
        <div className="w-full h-full bg-black/60 border-2 border-gray-600 rounded-lg relative overflow-hidden">
          <div className="absolute inset-2 bg-gradient-to-br from-green-800 to-blue-800 rounded">
            {/* Mini map content */}
            <div className="w-full h-full relative">
              {/* Player dot */}
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              {/* Some terrain features */}
              <div className="absolute top-2 left-2 w-3 h-3 bg-brown-600 rounded"></div>
              <div className="absolute bottom-3 right-2 w-4 h-2 bg-blue-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Selection UI (appears when targeting) */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
        <div className="bg-yellow-500 text-black px-3 py-1 rounded font-bold text-sm">
          🎯 Dirt
        </div>
      </div>

      {/* Status Messages */}
      <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className="bg-black/80 text-yellow-400 px-4 py-2 rounded text-sm border border-yellow-600">
          You are overloaded and move slowly.
        </div>
      </div>
    </div>
  );
}
