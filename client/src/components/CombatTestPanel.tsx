
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useGameState } from "../lib/stores/useGameState";
import { Sword, Target, Shield } from "lucide-react";

interface CombatTestPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CombatTestPanel({ isOpen, onClose }: CombatTestPanelProps) {
  const { enemies, spawnTestEnemy, removeEnemy, controlledNPCId, createdNPCs } = useGameState();
  const [combatLog, setCombatLog] = useState<string[]>([]);

  const addToCombatLog = (message: string) => {
    setCombatLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleSpawnEnemy = () => {
    spawnTestEnemy();
    addToCombatLog("Inimigo spawnou!");
  };

  const handleAttackNearestEnemy = () => {
    if (!controlledNPCId) {
      addToCombatLog("Nenhum NPC controlado!");
      return;
    }

    const controlledNPC = createdNPCs.find(npc => npc.id === controlledNPCId);
    if (!controlledNPC) return;

    // Find nearest enemy
    let nearestEnemy = null;
    let minDistance = Infinity;

    enemies.forEach(enemy => {
      const distance = Math.sqrt(
        Math.pow(enemy.position.x - controlledNPC.position.x, 2) +
        Math.pow(enemy.position.z - controlledNPC.position.z, 2)
      );
      
      if (distance < minDistance && distance < 2) {
        minDistance = distance;
        nearestEnemy = enemy;
      }
    });

    if (nearestEnemy) {
      // Deal damage to enemy
      const damage = 25 + Math.floor(Math.random() * 25);
      const takeDamageFunc = (window as any)[`enemy_${nearestEnemy.id}_takeDamage`];
      
      if (takeDamageFunc) {
        takeDamageFunc(damage);
        addToCombatLog(`${controlledNPC.name} atacou por ${damage} de dano!`);
      }
    } else {
      addToCombatLog("Nenhum inimigo próximo para atacar!");
    }
  };

  const handleClearAllEnemies = () => {
    enemies.forEach(enemy => removeEnemy(enemy.id));
    addToCombatLog("Todos os inimigos foram removidos!");
  };

  const handleSpawnMultipleEnemies = () => {
    for (let i = 0; i < 3; i++) {
      setTimeout(() => spawnTestEnemy(), i * 200);
    }
    addToCombatLog("3 inimigos spawnaram!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-20 left-4 z-20">
      <Card className="w-80 bg-gray-800/95 border-gray-600 text-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Sword size={20} className="text-red-500" />
            Teste de Combate
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-300">
            Teste o sistema de combate spawning inimigos e atacando
          </div>

          {/* Spawn Controls */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-yellow-400">Spawn Inimigos:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleSpawnEnemy}
                className="bg-red-600 hover:bg-red-700 text-white"
                size="sm"
              >
                <Target size={14} className="mr-1" />
                Spawn 1
              </Button>
              <Button
                onClick={handleSpawnMultipleEnemies}
                className="bg-red-700 hover:bg-red-800 text-white"
                size="sm"
              >
                <Target size={14} className="mr-1" />
                Spawn 3
              </Button>
            </div>
          </div>

          {/* Combat Controls */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-yellow-400">Combate:</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={handleAttackNearestEnemy}
                className="bg-orange-600 hover:bg-orange-700 text-white"
                size="sm"
                disabled={!controlledNPCId}
              >
                <Sword size={14} className="mr-1" />
                Atacar
              </Button>
              <Button
                onClick={handleClearAllEnemies}
                className="bg-gray-600 hover:bg-gray-700 text-white"
                size="sm"
              >
                <Shield size={14} className="mr-1" />
                Limpar
              </Button>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-yellow-400">Status:</h3>
            <div className="text-xs space-y-1">
              <div>Inimigos ativos: {enemies.length}</div>
              <div>NPC controlado: {controlledNPCId ? '✓' : '✗'}</div>
            </div>
          </div>

          {/* Combat Log */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-yellow-400">Log de Combate:</h3>
            <div className="bg-gray-900/50 p-2 rounded text-xs max-h-20 overflow-y-auto">
              {combatLog.length === 0 ? (
                <div className="text-gray-500">Nenhuma ação ainda...</div>
              ) : (
                combatLog.map((log, index) => (
                  <div key={index} className="text-gray-300">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="text-xs text-gray-400 border-t border-gray-600 pt-2">
            <div>• Controle um NPC primeiro</div>
            <div>• Spawne inimigos para testar</div>
            <div>• Use "Atacar" quando próximo de inimigos</div>
            <div>• Inimigos perseguem NPCs controlados</div>
          </div>

          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            size="sm"
          >
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
