import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { X, Plus, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useGameState } from "../lib/stores/useGameState";

interface NPCPanelProps {
  isOpen: boolean;
  housePosition: { x: number; z: number; id: string } | null;
  onClose: () => void;
  onCreateNPC: (name: string, houseId: string) => void;
}

export default function NPCPanel({ 
  isOpen, 
  housePosition, 
  onClose, 
  onCreateNPC 
}: NPCPanelProps) {
  const { isNPCCreationOpen, setNPCCreationOpen } = useGameState();
  const [npcName, setNpcName] = useState("");

  // Handle ESC key to close panel
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        if (isNPCCreationOpen) {
          setNPCCreationOpen(false);
          setNpcName("");
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
  }, [isOpen, isNPCCreationOpen, onClose, setNPCCreationOpen]);

  const handleCreateNPC = () => {
    if (npcName.trim() && housePosition) {
      onCreateNPC(npcName.trim(), housePosition.id);
      setNpcName("");
      setNPCCreationOpen(false);
    }
  };

  const handleOpenCreation = () => {
    setNPCCreationOpen(true);
  };

  const handleCancelCreation = () => {
    setNPCCreationOpen(false);
    setNpcName("");
  };

  if (!isOpen || !housePosition) return null;

  return (
    <div className="absolute top-4 right-4 z-20">
      <Card className="w-80 bg-gray-800/90 border-gray-600 text-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-bold">
            Casa ({housePosition.x}, {housePosition.z})
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
          <div className="text-sm text-gray-300">
            Gerencie esta casa e seus NPCs
          </div>

          {!isNPCCreationOpen ? (
            <>
              <div className="flex justify-center">
                <Button
                  className="h-16 w-40 flex flex-col items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleOpenCreation}
                >
                  <Plus size={24} />
                  <span>Criar NPC</span>
                </Button>
              </div>

              <div className="p-3 bg-gray-700/50 rounded text-sm text-gray-300">
                <div className="font-medium mb-1">Informações da Casa:</div>
                <div>• Posição: ({housePosition.x}, {housePosition.z})</div>
                <div>• ID: {housePosition.id}</div>
                <div>• NPCs: 0/1</div>
                <div>• Status: Vazia</div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-300 font-medium">
                Criar Novo NPC
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Nome do NPC:</label>
                <Input
                  type="text"
                  value={npcName}
                  onChange={(e) => setNpcName(e.target.value)}
                  placeholder="Digite o nome do aldeão..."
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  maxLength={20}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleCreateNPC}
                  disabled={!npcName.trim()}
                >
                  <User size={16} className="mr-2" />
                  Criar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={handleCancelCreation}
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
};