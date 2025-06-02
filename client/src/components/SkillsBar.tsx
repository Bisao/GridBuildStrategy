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
    initializeSkills 
  } = useSkills();

  const { 
    controlledNPCId, 
    createdNPCs, 
    enemies, 
    removeEnemy,
    updateNPC
  } = useGameState();

  const lastUpdateTime = useRef(performance.now());

  // Get controlled NPC stats
  const controlledNPC = controlledNPCId ? createdNPCs.find(npc => npc.id === controlledNPCId) : null;
  const health = controlledNPC?.health || 0;
  const maxHealth = controlledNPC?.maxHealth || 100;
  const mana = controlledNPC?.mana || 0;
  const maxMana = controlledNPC?.maxMana || 100;

  const isDead = health <= 0;

  // Initialize skills on mount
  useEffect(() => {
    if (skills.length === 0) {
      initializeSkills();
    }
  }, [skills.length, initializeSkills]);

  // Update cooldowns and regenerate mana
  useEffect(() => {
    const updateLoop = () => {
      const currentTime = performance.now();
      const deltaTime = (currentTime - lastUpdateTime.current) / 1000;
      lastUpdateTime.current = currentTime;

      updateCooldowns(deltaTime);

      // Regenerate mana for controlled NPC
      if (controlledNPC && controlledNPC.mana < controlledNPC.maxMana) {
        const newMana = Math.min(controlledNPC.maxMana, controlledNPC.mana + (deltaTime * 10));
        updateNPC(controlledNPC.id, { mana: newMana });
      }

      requestAnimationFrame(updateLoop);
    };

    const animationId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animationId);
  }, [updateCooldowns, controlledNPC, updateNPC]);

  // Handle skill activation
  const handleSkillClick = (skillId: string) => {
    if (!controlledNPCId || !controlledNPC) {
      console.log("Nenhum NPC controlado!");
      return;
    }

    const skill = skills.find(s => s.id === skillId);
    if (!skill || skill.currentCooldown > 0 || controlledNPC.mana < skill.manaCost || isDead) {
      if (controlledNPC.mana < skill.manaCost) {
        console.log("Mana insuficiente!");
      }
      return;
    }

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
  }, [activeSkillId, controlledNPCId, isDead]);

  // Execute skill when active skill is used
  const executeActiveSkill = (skillId: string, targetPosition?: THREE.Vector3) => {
    if (!controlledNPCId || !controlledNPC || isDead) return;

    const skill = skills.find(s => s.id === skillId);

    if (!skill || !useSkill(skillId)) {
      return;
    }

    // Consume mana from NPC
    const newMana = Math.max(0, controlledNPC.mana - skill.manaCost);
    updateNPC(controlledNPC.id, { mana: newMana });

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
    const npcPos = new THREE.Vector3(npc.position.x, 0, npc.position.z);
    let enemiesHit = 0;

    enemies.forEach(enemy => {
      const enemyPos = new THREE.Vector3(enemy.position.x, 0, enemy.position.z);
      const distance = npcPos.distanceTo(enemyPos);

      if (distance <= skill.range) {
        const baseDamage = skill.damage || 25;
        // Add some variation to damage
        const damage = baseDamage + Math.floor(Math.random() * 10) - 5;
        const takeDamageFunc = (window as any)[`enemy_${enemy.id}_takeDamage`];

        if (takeDamageFunc) {
          takeDamageFunc(damage);
          enemiesHit++;
          console.log(`${npc.name} usou ${skill.name} e causou ${damage} de dano!`);

          const createEffect = (window as any).createSkillEffect;
          if (createEffect) {
            createEffect(enemyPos, skill.id);
          }
        }
      }
    });

    if (enemiesHit === 0) {
      console.log(`${skill.name} não atingiu nenhum inimigo (alcance: ${skill.range}m)`);
    }
  };

  const executeHealSkill = (skill: any, npc: any) => {
    const healAmount = skill.healAmount || 40;
    const newHealth = Math.min(npc.maxHealth, npc.health + healAmount);
    updateNPC(npc.id, { health: newHealth });

    console.log(`${npc.name} se curou em ${healAmount} pontos de vida!`);

    const createEffect = (window as any).createSkillEffect;
    if (createEffect) {
      const npcPos = new THREE.Vector3(npc.position.x, 0, npc.position.z);
      createEffect(npcPos, skill.id);
    }
  };

  const executeUtilitySkill = (skill: any, npc: any, targetPosition?: THREE.Vector3) => {
    if (skill.id === 'dash' && targetPosition) {
      console.log(`${npc.name} fez uma investida!`);

      const createEffect = (window as any).createSkillEffect;
      if (createEffect) {
        const npcPos = new THREE.Vector3(npc.position.x, 0, npc.position.z);
        createEffect(npcPos, skill.id);
      }
    }
  };

  const executeDefenseSkill = (skill: any, npc: any, targetPosition?: THREE.Vector3) => {
    console.log(`${npc.name} usou ${skill.name} defensivamente!`);

    const createEffect = (window as any).createSkillEffect;
    if (createEffect) {
      const npcPos = new THREE.Vector3(npc.position.x, 0, npc.position.z);
      createEffect(npcPos, skill.id);
    }
  };

  const executeSkillOnEnemy = (enemyId: string) => {
    if (!controlledNPCId || !controlledNPC || isDead) return;

    const enemy = enemies.find(e => e.id === enemyId);

    if (!enemy) return;

    const npcPos = new THREE.Vector3(controlledNPC.position.x, 0, controlledNPC.position.z);
    const enemyPos = new THREE.Vector3(enemy.position.x, 0, enemy.position.z);
    const distance = npcPos.distanceTo(enemyPos);

    const basicAttack = skills.find(s => s.id === 'basic_attack');
    if (!basicAttack || basicAttack.currentCooldown > 0) {
      console.log("Ataque básico em cooldown!");
      return;
    }

    if (distance <= basicAttack.range) {
      if (useSkill('basic_attack')) {
        // Consume mana
        const newMana = Math.max(0, controlledNPC.mana - basicAttack.manaCost);
        updateNPC(controlledNPC.id, { mana: newMana });

        const baseDamage = basicAttack.damage || 25;
        const damage = baseDamage + Math.floor(Math.random() * 10) - 5;
        const takeDamageFunc = (window as any)[`enemy_${enemy.id}_takeDamage`];

        if (takeDamageFunc) {
          takeDamageFunc(damage);
          console.log(`${controlledNPC.name} atacou o inimigo com ${basicAttack.name} causando ${damage} de dano!`);

          const createEffect = (window as any).createSkillEffect;
          if (createEffect) {
            createEffect(enemyPos, 'basic_attack');
          }
        }
      }
    } else {
      console.log(`Inimigo muito longe para atacar! Distância: ${distance.toFixed(1)}m (máximo: ${basicAttack.range}m)`);
    }
  };

  // Create damage effect function
  const createDamageEffect = (position: THREE.Vector3, damage: number, source: 'player' | 'enemy') => {
    const damageElement = document.createElement('div');
    damageElement.style.position = 'fixed';
    damageElement.style.pointerEvents = 'none';
    damageElement.style.zIndex = '1000';
    damageElement.style.fontSize = '24px';
    damageElement.style.fontWeight = 'bold';
    damageElement.style.color = source === 'player' ? '#FF4444' : '#44FF44';
    damageElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
    damageElement.textContent = `-${damage}`;

    // Convert 3D position to screen coordinates (simplified)
    const screenX = window.innerWidth / 2 + (position.x * 20);
    const screenY = window.innerHeight / 2 - (position.z * 20) - 100;

    damageElement.style.left = `${screenX}px`;
    damageElement.style.top = `${screenY}px`;

    document.body.appendChild(damageElement);

    // Animate the damage number
    let opacity = 1;
    let y = screenY;
    const animate = () => {
      opacity -= 0.02;
      y -= 2;
      damageElement.style.opacity = opacity.toString();
      damageElement.style.top = `${y}px`;

      if (opacity > 0) {
        requestAnimationFrame(animate);
      } else {
        document.body.removeChild(damageElement);
      }
    };
    requestAnimationFrame(animate);
  };

  // Expose functions globally for world interaction
  useEffect(() => {
    (window as any).executeActiveSkill = executeActiveSkill;
    (window as any).executeSkillOnEnemy = executeSkillOnEnemy;
    (window as any).createDamageEffect = createDamageEffect;
    (window as any).enemies = enemies;
    return () => {
      delete (window as any).executeActiveSkill;
      delete (window as any).executeSkillOnEnemy;
      delete (window as any).createDamageEffect;
      delete (window as any).enemies;
    };
  }, [activeSkillId, controlledNPCId, skills, enemies, isDead]);

  if (!controlledNPCId || !controlledNPC) {
    return null;
  }

  const getCooldownPercentage = (skill: any) => {
    return skill.cooldown > 0 ? (skill.currentCooldown / skill.cooldown) * 100 : 0;
  };

  const healthPercentage = (health / maxHealth) * 100;
  const manaPercentage = (mana / maxMana) * 100;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-20">
      <div className="flex items-center justify-center gap-8">

        {/* Health Orb - Left Side */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-red-800 bg-gradient-to-br from-red-900 via-red-700 to-red-500 shadow-2xl relative overflow-hidden">
            {/* Health fill effect */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-400 to-red-300 transition-all duration-500"
              style={{ height: `${healthPercentage}%` }}
            />

            {/* Shine effect */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-red-200/20 via-transparent to-transparent" />

            {/* Border glow */}
            <div className="absolute inset-0 rounded-full border-2 border-red-400/50 shadow-inner" />
          </div>

          {/* Health text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold text-sm">
            <span className="text-lg">{Math.floor(health)}</span>
            <span className="text-xs opacity-80">{maxHealth}</span>
          </div>

          {/* Health icon */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full border-2 border-red-400 flex items-center justify-center">
            <span className="text-white text-xs">❤️</span>
          </div>
        </div>

        {/* Skills Panel - Center */}
        <div className="bg-gradient-to-b from-gray-800/95 to-gray-900/95 border-2 border-yellow-600 rounded-lg p-3 shadow-2xl">
          {/* Title bar */}
          <div className="text-center mb-2 text-yellow-400 font-bold text-sm border-b border-yellow-600/50 pb-1">
            HABILIDADES
          </div>

          <div className={`flex gap-2 ${isDead ? 'relative' : ''}`}>
            {skills.map((skill, index) => {
              const isOnCooldown = skill.currentCooldown > 0;
              const hasInsufficientMana = mana < skill.manaCost;
              const isDisabled = isOnCooldown || hasInsufficientMana || isDead;

              return (
                <div key={skill.id} className="relative group">
                  <button
                    onClick={() => handleSkillClick(skill.id)}
                    className={`
                      w-12 h-12 border-2 rounded transition-all duration-200 relative overflow-hidden
                      ${isDisabled 
                        ? 'border-gray-600 bg-gray-800/80 opacity-60 cursor-not-allowed' 
                        : 'border-yellow-500 bg-gradient-to-br from-gray-700 to-gray-800 hover:border-yellow-400 hover:from-gray-600 hover:to-gray-700 cursor-pointer shadow-lg'
                      }
                      ${activeSkillId === skill.id ? 'border-orange-400 bg-gradient-to-br from-orange-900/50 to-red-900/50' : ''}
                    `}
                    disabled={isDisabled}
                    title={`${skill.name} (${index + 1})`}
                  >
                    <div className="text-lg">{skill.icon}</div>

                    {/* Cooldown overlay */}
                    {isOnCooldown && (
                      <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                        <div
                          className="absolute inset-0 bg-gray-900"
                          style={{
                            clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(2 * Math.PI * (1 - getCooldownPercentage(skill) / 100) - Math.PI/2)}% ${50 + 50 * Math.sin(2 * Math.PI * (1 - getCooldownPercentage(skill) / 100) - Math.PI/2)}%, 50% 50%)`
                          }}
                        />
                        <span className="text-xs text-white font-bold z-10">
                          {Math.ceil(skill.currentCooldown)}
                        </span>
                      </div>
                    )}

                    {/* Mana cost indicator */}
                    {hasInsufficientMana && !isOnCooldown && !isDead && (
                      <div className="absolute inset-0 bg-blue-900/70 flex items-center justify-center">
                        <span className="text-xs text-blue-200 font-bold">
                          {skill.manaCost}
                        </span>
                      </div>
                    )}

                    {/* Key number */}
                    <div className="absolute -bottom-1 -right-1 bg-yellow-600 text-black text-xs w-4 h-4 flex items-center justify-center rounded-full border border-yellow-400 font-bold">
                      {index + 1}
                    </div>
                  </button>

                  {/* Tooltip */}
                  <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 bg-black/95 border border-yellow-400 text-white text-xs p-3 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30 min-w-[180px]">
                    <div className="font-bold text-yellow-400 mb-1">{skill.name}</div>
                    <div className="text-gray-300 mb-2">{skill.description}</div>

                    <div className="border-t border-gray-600 pt-2 space-y-1 text-xs">
                      {skill.damage && (
                        <div className="flex justify-between">
                          <span>Dano:</span>
                          <span className="text-red-400">{skill.damage}</span>
                        </div>
                      )}
                      {skill.healAmount && (
                        <div className="flex justify-between">
                          <span>Cura:</span>
                          <span className="text-green-400">{skill.healAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Alcance:</span>
                        <span className="text-blue-400">{skill.range}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cooldown:</span>
                        <span className="text-purple-400">{skill.cooldown}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mana:</span>
                        <span className="text-blue-400">{skill.manaCost}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Death overlay */}
            {isDead && (
              <div className="absolute inset-0 bg-red-900/80 rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-red-200">MORTO</span>
              </div>
            )}
          </div>

          {/* Control instructions */}
          <div className="text-xs text-gray-400 mt-2 text-center">
            Teclas <span className="text-yellow-400">1-5</span> para usar
          </div>
        </div>

        {/* Mana Orb - Right Side */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-blue-800 bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 shadow-2xl relative overflow-hidden">
            {/* Mana fill effect */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-300 transition-all duration-500"
              style={{ height: `${manaPercentage}%` }}
            />

            {/* Shine effect */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-200/20 via-transparent to-transparent" />

            {/* Border glow */}
            <div className="absolute inset-0 rounded-full border-2 border-blue-400/50 shadow-inner" />
          </div>

          {/* Mana text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white font-bold text-sm">
            <span className="text-lg">{Math.floor(mana)}</span>
            <span className="text-xs opacity-80">{maxMana}</span>
          </div>

          {/* Mana icon */}
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full border-2 border-blue-400 flex items-center justify-center">
            <span className="text-white text-xs">💧</span>
          </div>
        </div>
      </div>
    </div>
  );
}