
import React, { useEffect } from 'react';
import { useGameState } from '../lib/stores/useGameState';
import { useCombatState } from '../lib/stores/useCombatState';

const SkillsBar: React.FC = () => {
  const { controlledNPCId, viewingNPCId, enemies } = useGameState();
  const { 
    skills, 
    playerStats, 
    activeSkill, 
    setActiveSkill, 
    useSkill, 
    updateSkillCooldowns,
    addToCombatLog 
  } = useCombatState();

  // Update cooldowns every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      updateSkillCooldowns();
    }, 100);

    return () => clearInterval(interval);
  }, [updateSkillCooldowns]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!controlledNPCId || viewingNPCId) return;

      const skill = skills.find(s => s.key.toLowerCase() === event.key.toLowerCase());
      if (skill) {
        handleSkillUse(skill.id);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [skills, controlledNPCId, viewingNPCId]);

  const handleSkillUse = (skillId: string) => {
    if (!controlledNPCId) return;

    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;

    // Para skills de dano, encontrar inimigo próximo
    if (skill.type === 'damage') {
      const controlledNPC = useGameState.getState().createdNPCs.find(npc => npc.id === controlledNPCId);
      if (!controlledNPC) return;

      let nearestEnemy = null;
      let minDistance = Infinity;

      enemies.forEach(enemy => {
        const distance = Math.sqrt(
          Math.pow(enemy.position.x - controlledNPC.position.x, 2) +
          Math.pow(enemy.position.z - controlledNPC.position.z, 2)
        );
        
        if (distance < minDistance && distance <= skill.range) {
          minDistance = distance;
          nearestEnemy = enemy;
        }
      });

      if (nearestEnemy && skill.damage) {
        if (useSkill(skillId, nearestEnemy.id)) {
          // Aplicar dano ao inimigo
          const takeDamageFunc = (window as any)[`enemy_${nearestEnemy.id}_takeDamage`];
          if (takeDamageFunc) {
            const totalDamage = skill.damage + playerStats.attack;
            takeDamageFunc(totalDamage);
            addToCombatLog(`${skill.name} causou ${totalDamage} de dano!`);
          }
        }
      } else if (!nearestEnemy) {
        addToCombatLog(`Nenhum inimigo ao alcance para ${skill.name}!`);
      }
    } else if (skill.type === 'heal') {
      if (useSkill(skillId)) {
        useCombatState.getState().heal(skill.healAmount || 0);
      }
    } else {
      // Outras habilidades (buff, debuff, utility)
      if (useSkill(skillId)) {
        addToCombatLog(`${skill.name} ativado!`);
      }
    }
  };

  const handleSkillClick = (skillId: string) => {
    if (activeSkill === skillId) {
      setActiveSkill(null);
    } else {
      setActiveSkill(skillId);
      handleSkillUse(skillId);
    }
  };

  // Só mostra a barra se um NPC estiver sendo controlado pelo jogador
  if (!controlledNPCId || viewingNPCId) return null;

  const healthPercent = (playerStats.health / playerStats.maxHealth) * 100;
  const manaPercent = (playerStats.mana / playerStats.maxMana) * 100;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-1 bg-gray-800/95 backdrop-blur-sm rounded-lg p-2 border border-gray-600/50 shadow-2xl">
        {skills.map((skill) => {
          const isOnCooldown = (skill.remainingCooldown || 0) > 0;
          const cooldownPercent = isOnCooldown ? ((skill.remainingCooldown || 0) / skill.cooldown) * 100 : 0;
          const canAfford = playerStats.mana >= skill.manaCost;

          return (
            <div key={skill.id} className="relative group">
              <button
                onClick={() => handleSkillClick(skill.id)}
                disabled={isOnCooldown || !canAfford}
                className={`
                  w-12 h-12 border-2 rounded-lg flex flex-col items-center justify-center 
                  transition-all duration-200 transform hover:scale-105 active:scale-95
                  ${isOnCooldown || !canAfford 
                    ? 'bg-gray-700/50 border-gray-600/50 cursor-not-allowed opacity-50' 
                    : 'bg-gray-700/80 hover:bg-gray-600/80 border-gray-500/50 hover:border-gray-400/70'
                  }
                  ${activeSkill === skill.id ? 'border-yellow-400 bg-yellow-600/20' : ''}
                  ${skill.type === 'damage' ? 'hover:border-red-400/70' : ''}
                  ${skill.type === 'heal' ? 'hover:border-green-400/70' : ''}
                  ${skill.type === 'buff' ? 'hover:border-blue-400/70' : ''}
                  ${skill.type === 'utility' ? 'hover:border-purple-400/70' : ''}
                `}
                title={`${skill.name} (${skill.key}) - ${skill.description}`}
              >
                {/* Ícone da habilidade */}
                <span className="text-lg mb-0.5">{skill.icon}</span>
                
                {/* Tecla de atalho */}
                <span className="text-xs text-gray-300 font-bold leading-none">
                  {skill.key}
                </span>
                
                {/* Indicador de cooldown */}
                {isOnCooldown && (
                  <div 
                    className="absolute inset-0 bg-gray-900/80 rounded-lg flex items-center justify-center"
                    style={{
                      background: `conic-gradient(from 0deg, transparent ${100-cooldownPercent}%, rgba(0,0,0,0.8) ${100-cooldownPercent}%)`
                    }}
                  >
                    <span className="text-xs text-white font-bold">
                      {Math.ceil((skill.remainingCooldown || 0) / 1000)}
                    </span>
                  </div>
                )}

                {/* Indicador de mana insuficiente */}
                {!canAfford && !isOnCooldown && (
                  <div className="absolute inset-0 border-2 border-blue-500 rounded-lg animate-pulse"></div>
                )}
                
                {/* Indicador de ativo */}
                {activeSkill === skill.id && !isOnCooldown && (
                  <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg animate-pulse"></div>
                )}

                {/* Custo de mana */}
                {skill.manaCost > 0 && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {skill.manaCost}
                  </div>
                )}
              </button>
              
              {/* Tooltip aprimorado */}
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap">
                  <div className="font-bold text-yellow-400">{skill.name} ({skill.key})</div>
                  <div className="text-gray-300">{skill.description}</div>
                  <div className="text-blue-300">Mana: {skill.manaCost}</div>
                  <div className="text-red-300">Cooldown: {skill.cooldown/1000}s</div>
                  {skill.damage && <div className="text-orange-300">Dano: {skill.damage}</div>}
                  {skill.healAmount && <div className="text-green-300">Cura: {skill.healAmount}</div>}
                  <div className="text-purple-300">Alcance: {skill.range}</div>
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Barras de vida e mana aprimoradas */}
      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex gap-4">
        {/* Barra de vida */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-red-300 mb-1 font-bold">❤️ VIDA {playerStats.health}/{playerStats.maxHealth}</span>
          <div className="bg-red-900/80 h-4 w-40 rounded-full overflow-hidden border border-red-400/50 shadow-lg">
            <div 
              className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-300"
              style={{ width: `${healthPercent}%` }}
            ></div>
          </div>
        </div>
        
        {/* Barra de mana */}
        <div className="flex flex-col items-center">
          <span className="text-xs text-blue-300 mb-1 font-bold">💙 MANA {playerStats.mana}/{playerStats.maxMana}</span>
          <div className="bg-blue-900/80 h-4 w-40 rounded-full overflow-hidden border border-blue-400/50 shadow-lg">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-400 h-full transition-all duration-300"
              style={{ width: `${manaPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Stats adicionais */}
      <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 text-xs text-gray-300 flex gap-4">
        <span>⚔️ ATK: {playerStats.attack}</span>
        <span>🛡️ DEF: {playerStats.defense}</span>
        <span>⚡ SPD: {playerStats.speed}</span>
      </div>
    </div>
  );
};

export default SkillsBar;
