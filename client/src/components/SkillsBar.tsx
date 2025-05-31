
import { useEffect, useRef } from "react";
import { useSkills } from "../lib/stores/useSkills";
import { useGameState } from "../lib/stores/useGameState";
import * as THREE from "three";

export default function SkillsBar() {
  const { 
    skills, 
    activeSkillId, 
    setActiveSkill, 
    useSkill, 
    updateCooldowns,
    updateMana,
    mana,
    maxMana,
    initializeSkills 
  } = useSkills();
  
  const { 
    controlledNPCId, 
    createdNPCs, 
    enemies, 
    removeEnemy 
  } = useGameState();
  
  const lastUpdateTime = useRef(performance.now());

  // Initialize skills on mount
  useEffect(() => {
    initializeSkills();
  }, [initializeSkills]);

  // Update cooldowns and mana
  useEffect(() => {
    const updateLoop = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = currentTime;
      
      updateCooldowns(deltaTime);
      updateMana(deltaTime);
      requestAnimationFrame(updateLoop);
    };
    
    const animationId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animationId);
  }, [updateCooldowns, updateMana]);

  // Handle skill activation
  const handleSkillClick = (skillId: string) => {
    if (!controlledNPCId) {
      console.log("Nenhum NPC controlado!");
      return;
    }

    const skill = skills.find(s => s.id === skillId);
    if (!skill || skill.currentCooldown > 0 || mana < skill.manaCost) {
      if (mana < skill.manaCost) {
        console.log("Mana insuficiente!");
      }
      return;
    }

    // Ativar skill imediatamente
    executeActiveSkill(skillId);
  };

  // Handle skill usage on world click
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const keyMap: { [key: string]: string } = {
        '1': 'basic_attack',
        '2': 'heavy_strike', 
        '3': 'heal',
        '4': 'dash',
        '5': 'shield_bash'
      };

      const skillId = keyMap[event.key];
      if (skillId) {
        handleSkillClick(skillId);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeSkillId, controlledNPCId]);

  // Execute skill when active skill is used
  const executeActiveSkill = (skillId: string, targetPosition?: THREE.Vector3) => {
    if (!controlledNPCId) return;

    const skill = skills.find(s => s.id === skillId);
    const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
    
    if (!skill || !controlledNPC || !useSkill(skillId)) {
      return;
    }

    console.log(`Executando skill: ${skill.name}`);

    switch (skill.type) {
      case 'attack':
        executeAttackSkill(skill, controlledNPC, targetPosition);
        break;
      case 'heal':
        executeHealSkill(skill, controlledNPC);
        break;
      case 'utility':
        executeUtilitySkill(skill, controlledNPC, targetPosition);
        break;
      case 'defense':
        executeDefenseSkill(skill, controlledNPC, targetPosition);
        break;
    }
  };

  const executeAttackSkill = (skill: any, npc: any, targetPosition?: THREE.Vector3) => {
    // Find enemies in range
    const npcPos = new THREE.Vector3(npc.position.x, 0, npc.position.z);
    
    enemies.forEach(enemy => {
      const enemyPos = new THREE.Vector3(enemy.position.x, 0, enemy.position.z);
      const distance = npcPos.distanceTo(enemyPos);
      
      if (distance <= skill.range) {
        const damage = skill.damage || 25;
        const takeDamageFunc = (window as any)[`enemy_${enemy.id}_takeDamage`];
        
        if (takeDamageFunc) {
          takeDamageFunc(damage);
          console.log(`${npc.name} usou ${skill.name} e causou ${damage} de dano!`);
          
          // Create visual effect at enemy position
          const createEffect = (window as any).createSkillEffect;
          if (createEffect) {
            createEffect(enemyPos, skill.id);
          }
        }
      }
    });
  };

  const executeHealSkill = (skill: any, npc: any) => {
    const healAmount = skill.healAmount || 40;
    console.log(`${npc.name} se curou em ${healAmount} pontos de vida!`);
    
    // Create visual effect at NPC position
    const createEffect = (window as any).createSkillEffect;
    if (createEffect) {
      const npcPos = new THREE.Vector3(npc.position.x, 0, npc.position.z);
      createEffect(npcPos, skill.id);
    }
  };

  const executeUtilitySkill = (skill: any, npc: any, targetPosition?: THREE.Vector3) => {
    if (skill.id === 'dash' && targetPosition) {
      console.log(`${npc.name} fez uma investida!`);
      
      // Create visual effect at NPC position
      const createEffect = (window as any).createSkillEffect;
      if (createEffect) {
        const npcPos = new THREE.Vector3(npc.position.x, 0, npc.position.z);
        createEffect(npcPos, skill.id);
      }
    }
  };

  const executeDefenseSkill = (skill: any, npc: any, targetPosition?: THREE.Vector3) => {
    console.log(`${npc.name} usou ${skill.name} defensivamente!`);
    
    // Create visual effect at NPC position
    const createEffect = (window as any).createSkillEffect;
    if (createEffect) {
      const npcPos = new THREE.Vector3(npc.position.x, 0, npc.position.z);
      createEffect(npcPos, skill.id);
    }
  };

  // Function to execute skill on specific enemy
  const executeSkillOnEnemy = (enemyId: string) => {
    if (!controlledNPCId) return;

    const enemy = enemies.find(e => e.id === enemyId);
    const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
    
    if (!enemy || !controlledNPC) return;

    // Check distance to enemy
    const npcPos = new THREE.Vector3(controlledNPC.position.x, 0, controlledNPC.position.z);
    const enemyPos = new THREE.Vector3(enemy.position.x, 0, enemy.position.z);
    const distance = npcPos.distanceTo(enemyPos);

    // Use basic attack skill
    const basicAttack = skills.find(s => s.id === 'basic_attack');
    if (!basicAttack || basicAttack.currentCooldown > 0) {
      console.log("Ataque básico em cooldown!");
      return;
    }

    if (distance <= basicAttack.range) {
      if (useSkill('basic_attack')) {
        const damage = basicAttack.damage || 25;
        const takeDamageFunc = (window as any)[`enemy_${enemy.id}_takeDamage`];
        
        if (takeDamageFunc) {
          takeDamageFunc(damage);
          console.log(`${controlledNPC.name} atacou o inimigo com ${basicAttack.name}!`);
          
          // Create visual effect at enemy position
          const createEffect = (window as any).createSkillEffect;
          if (createEffect) {
            createEffect(enemyPos, 'basic_attack');
          }
        }
      }
    } else {
      console.log("Inimigo muito longe para atacar!");
    }
  };

  // Expose functions globally for world interaction
  useEffect(() => {
    (window as any).executeActiveSkill = executeActiveSkill;
    (window as any).executeSkillOnEnemy = executeSkillOnEnemy;
    (window as any).enemies = enemies;
    return () => {
      delete (window as any).executeActiveSkill;
      delete (window as any).executeSkillOnEnemy;
      delete (window as any).enemies;
    };
  }, [activeSkillId, controlledNPCId, skills, enemies]);

  if (!controlledNPCId) {
    return null;
  }

  const getCooldownPercentage = (skill: any) => {
    return skill.cooldown > 0 ? (skill.currentCooldown / skill.cooldown) * 100 : 0;
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
      {/* Mana Bar */}
      <div className="mb-2 flex justify-center">
        <div className="bg-black/80 border border-blue-400 rounded-full px-4 py-1 min-w-[200px]">
          <div className="flex items-center justify-between text-xs text-white mb-1">
            <span>MANA</span>
            <span>{Math.floor(mana)}/{maxMana}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(mana / maxMana) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Skills Hotbar - Albion Style */}
      <div className="bg-black/90 border-2 border-gray-500 rounded-lg p-2">
        <div className="flex gap-1 items-center">
          {skills.map((skill, index) => {
            const isOnCooldown = skill.currentCooldown > 0;
            const hasInsufficientMana = mana < skill.manaCost;
            const isDisabled = isOnCooldown || hasInsufficientMana;
            
            return (
              <div
                key={skill.id}
                className="relative group"
              >
                <button
                  onClick={() => handleSkillClick(skill.id)}
                  className={`
                    w-14 h-14 border-2 transition-all duration-200 relative overflow-hidden
                    ${isDisabled 
                      ? 'border-gray-600 bg-gray-800 opacity-60 cursor-not-allowed' 
                      : 'border-yellow-400 bg-gray-700 hover:border-yellow-300 hover:bg-gray-600 cursor-pointer'
                    }
                    ${activeSkillId === skill.id ? 'border-red-400 bg-red-900/30' : ''}
                  `}
                  disabled={isDisabled}
                  title={`${skill.name} (${index + 1}) - ${skill.description}`}
                >
                  <div className="text-xl">{skill.icon}</div>
                  
                  {/* Cooldown overlay */}
                  {isOnCooldown && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `conic-gradient(from 0deg, transparent ${100 - getCooldownPercentage(skill)}%, rgba(0,0,0,0.8) ${100 - getCooldownPercentage(skill)}%)`
                        }}
                      />
                      <span className="text-xs text-white font-bold z-10">
                        {Math.ceil(skill.currentCooldown)}
                      </span>
                    </div>
                  )}

                  {/* Mana cost indicator */}
                  {hasInsufficientMana && !isOnCooldown && (
                    <div className="absolute inset-0 bg-blue-900/60 flex items-center justify-center">
                      <span className="text-xs text-blue-200 font-bold">
                        {skill.manaCost}
                      </span>
                    </div>
                  )}
                  
                  {/* Key indicator */}
                  <div className="absolute bottom-0 right-0 bg-black/80 text-yellow-400 text-xs w-4 h-4 flex items-center justify-center border border-yellow-400">
                    {index + 1}
                  </div>

                  {/* Mana cost bottom indicator */}
                  <div className="absolute bottom-0 left-0 bg-blue-600 text-white text-xs px-1 leading-none">
                    {skill.manaCost}
                  </div>
                </button>

                {/* Enhanced Tooltip - Albion Style */}
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-black/95 border border-yellow-400 text-white text-xs p-3 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 min-w-[200px]">
                  <div className="font-bold text-yellow-400 text-sm mb-1">{skill.name}</div>
                  <div className="text-gray-300 mb-2">{skill.description}</div>
                  
                  <div className="border-t border-gray-600 pt-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tecla:</span>
                      <span className="text-yellow-400">{index + 1}</span>
                    </div>
                    {skill.damage && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dano:</span>
                        <span className="text-red-400">{skill.damage}</span>
                      </div>
                    )}
                    {skill.healAmount && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cura:</span>
                        <span className="text-green-400">{skill.healAmount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Alcance:</span>
                      <span className="text-blue-400">{skill.range}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cooldown:</span>
                      <span className="text-purple-400">{skill.cooldown}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Mana:</span>
                      <span className="text-blue-400">{skill.manaCost}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="text-xs text-gray-400 mt-2 text-center">
          <span className="text-yellow-400">1-5</span> para usar skills • 
          <span className="text-blue-400">Azul</span> = sem mana • 
          <span className="text-gray-400">Cinza</span> = cooldown
        </div>
      </div>
    </div>
  );
}
