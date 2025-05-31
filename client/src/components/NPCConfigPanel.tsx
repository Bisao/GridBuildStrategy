
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { X, User, Trash2, Play, Pause, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";
import { useGameState } from "../lib/stores/useGameState";

interface NPCConfigPanelProps {
  isOpen: boolean;
  npcId: string | null;
  onClose: () => void;
}

export default function NPCConfigPanel({ 
  isOpen, 
  npcId, 
  onClose 
}: NPCConfigPanelProps) {
  const { createdNPCs, updateNPC, removeNPC } = useGameState();
  const [npcName, setNpcName] = useState("");
  const [npcType, setNpcType] = useState<"villager" | "guard" | "merchant" | "farmer">("villager");
  const [npcAnimation, setNpcAnimation] = useState<"idle" | "walk">("idle");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get current NPC data
  const currentNPC = npcId ? createdNPCs.find(npc => npc.id === npcId) : null;

  // Update local state when NPC changes
  useEffect(() => {
    if (currentNPC) {
      setNpcName(currentNPC.name);
      setNpcType(currentNPC.type);
      setNpcAnimation(currentNPC.animation || "idle");
    }
  }, [currentNPC]);

  // Handle ESC key to close panel
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, showDeleteConfirm, onClose]);

  const handleSaveChanges = () => {
    if (currentNPC && npcName.trim()) {
      updateNPC(currentNPC.id, {
        name: npcName.trim(),
        type: npcType,
        animation: npcAnimation
      });
      console.log(`NPC ${currentNPC.id} atualizado com sucesso`);
    }
  };

  const handleDeleteNPC = () => {
    if (currentNPC) {
      removeNPC(currentNPC.id);
      console.log(`NPC ${currentNPC.id} removido com sucesso`);
      onClose();
    }
  };

  const handleRandomizePosition = () => {
    if (currentNPC) {
      // Gerar nova posição aleatória ao redor da estrutura
      const randomOffset = () => (Math.random() - 0.5) * 2;
      const newPosition = {
        x: currentNPC.position.x + randomOffset(),
        z: currentNPC.position.z + randomOffset()
      };
      
      updateNPC(currentNPC.id, { position: newPosition });
      console.log(`Posição do NPC ${currentNPC.id} randomizada`);
    }
  };

  if (!isOpen || !currentNPC) return null;

  return (
    <div className="absolute top-4 left-4 z-30">
      <Card className="w-80 bg-gray-800/90 border-gray-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <User size={20} />
            Configurar NPC
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={16} />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {!showDeleteConfirm ? (
            <>
              <div className="text-sm text-gray-300">
                Configure as propriedades deste NPC
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Nome do NPC:</label>
                  <Input
                    type="text"
                    value={npcName}
                    onChange={(e) => setNpcName(e.target.value)}
                    placeholder="Digite o nome do NPC..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    maxLength={20}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Tipo do NPC:</label>
                  <Select value={npcType} onValueChange={(value: any) => setNpcType(value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="villager">Aldeão</SelectItem>
                      <SelectItem value="guard">Guarda</SelectItem>
                      <SelectItem value="merchant">Comerciante</SelectItem>
                      <SelectItem value="farmer">Fazendeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Animação:</label>
                  <Select value={npcAnimation} onValueChange={(value: any) => setNpcAnimation(value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="idle">Parado</SelectItem>
                      <SelectItem value="walk">Caminhando</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-3 bg-gray-700/50 rounded text-sm text-gray-300">
                <div className="font-medium mb-1">Informações do NPC:</div>
                <div>• ID: {currentNPC.id}</div>
                <div>• Posição: ({currentNPC.position.x.toFixed(1)}, {currentNPC.position.z.toFixed(1)})</div>
                <div>• Estrutura: {currentNPC.structureId}</div>
                <div>• Status: Ativo</div>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSaveChanges}
                  disabled={!npcName.trim()}
                >
                  Salvar Alterações
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={handleRandomizePosition}
                >
                  <RotateCw size={16} className="mr-2" />
                  Randomizar Posição
                </Button>

                <Button
                  variant="destructive"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={16} className="mr-2" />
                  Remover NPC
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-red-400 font-medium mb-2">
                  Confirmar Remoção
                </div>
                <div className="text-sm text-gray-300">
                  Tem certeza que deseja remover o NPC "{currentNPC.name}"?
                  Esta ação não pode ser desfeita.
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeleteNPC}
                >
                  Sim, Remover
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
