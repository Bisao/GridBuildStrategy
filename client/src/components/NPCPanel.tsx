import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { X, Plus, User } from "lucide-react";
import { useEffect } from "react";

interface NPCPanelProps {
  isOpen: boolean;
  housePosition: { x: number; z: number } | null;
  onClose: () => void;
  onCreateNPC: (type: 'villager' | 'guard' | 'merchant' | 'farmer') => void;
}

export default function NPCPanel({ 
  isOpen, 
  housePosition, 
  onClose, 
  onCreateNPC 
}: NPCPanelProps) {
  // Handle ESC key to close panel
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, onClose]);

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

          <div className="grid grid-cols-2 gap-2">
            <Button
              className="h-20 flex flex-col items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs"
              onClick={() => onCreateNPC('villager')}
            >
              <User size={20} />
              <span>Aldeão</span>
            </Button>
            
            <Button
              className="h-20 flex flex-col items-center justify-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs"
              onClick={() => onCreateNPC('guard')}
            >
              <User size={20} />
              <span>Guarda</span>
            </Button>
            
            <Button
              className="h-20 flex flex-col items-center justify-center gap-1 bg-purple-600 hover:bg-purple-700 text-white text-xs"
              onClick={() => onCreateNPC('merchant')}
            >
              <User size={20} />
              <span>Mercador</span>
            </Button>
            
            <Button
              className="h-20 flex flex-col items-center justify-center gap-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs"
              onClick={() => onCreateNPC('farmer')}
            >
              <User size={20} />
              <span>Fazendeiro</span>
            </Button>
          </div>

          <div className="p-3 bg-gray-700/50 rounded text-sm text-gray-300">
            <div className="font-medium mb-1">Informações da Casa:</div>
            <div>• Posição: ({housePosition.x}, {housePosition.z})</div>
            <div>• NPCs: 0/1</div>
            <div>• Status: Vazia</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};