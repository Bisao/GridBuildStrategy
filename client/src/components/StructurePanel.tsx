import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Home, X, Settings, Castle, Hammer, ShoppingCart, Menu, Save } from "lucide-react";
import { useEffect } from "react";
import { useGameState } from "../lib/stores/useGameState";

interface StructurePanelProps {
  selectedStructure?: string | null;
  onSelectStructure: (structure: string | null) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenSaveLoad?: () => void;
}

export default function StructurePanel({ 
  selectedStructure, 
  onSelectStructure,
  isOpen,
  onClose,
  onOpenSaveLoad
}: StructurePanelProps) {
  const { setStructurePanelOpen } = useGameState();
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

  return (
    <div className="fixed top-2 left-2 z-10 sm:top-4 sm:left-4">
      {/* Toggle Button */}
      <Button
        onClick={() => setStructurePanelOpen(!isOpen)}
        className="mb-2 bg-gray-800/90 border-gray-700 text-white hover:bg-gray-700 backdrop-blur-sm"
        size="sm"
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Panel */}
      {isOpen && (
        <Card className="w-48 sm:w-64 bg-gray-800/90 border-gray-700 backdrop-blur-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-white text-sm sm:text-lg">Estruturas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">


        {/* Structure buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => onSelectStructure('house')}
              variant={selectedStructure === 'house' ? 'default' : 'outline'}
              className="flex flex-col items-center gap-1 h-auto py-2 text-xs"
            >
              <Home size={16} />
              Casa
            </Button>

            <Button
              onClick={() => onSelectStructure('largehouse')}
              variant={selectedStructure === 'largehouse' ? 'default' : 'outline'}
              className="flex flex-col items-center gap-1 h-auto py-2 text-xs"
            >
              <Castle size={16} />
              Casa Grande
            </Button>

            <Button
              onClick={() => onSelectStructure('windmill')}
              variant={selectedStructure === 'windmill' ? 'default' : 'outline'}
              className="flex flex-col items-center gap-1 h-auto py-2 text-xs"
            >
              <Settings size={16} />
              Moinho
            </Button>

            <Button
              onClick={() => onSelectStructure('tower')}
              variant={selectedStructure === 'tower' ? 'default' : 'outline'}
              className="flex flex-col items-center gap-1 h-auto py-2 text-xs"
            >
              <Castle size={16} />
              Torre
            </Button>

            <Button
              onClick={() => onSelectStructure('blacksmith')}
              variant={selectedStructure === 'blacksmith' ? 'default' : 'outline'}
              className="flex flex-col items-center gap-1 h-auto py-2 text-xs"
            >
              <Hammer size={16} />
              Ferraria
            </Button>

            <Button
              onClick={() => onSelectStructure('market')}
              variant={selectedStructure === 'market' ? 'default' : 'outline'}
              className="flex flex-col items-center gap-1 h-auto py-2 text-xs"
            >
              <ShoppingCart size={16} />
              Mercado
            </Button>
          </div>

          {/* Clear selection button */}
          {selectedStructure && (
            <Button
              onClick={() => onSelectStructure(null)}
              variant="destructive"
              className="w-full mt-2 flex items-center justify-center gap-2"
            >
              <X size={16} />
              Cancelar
            </Button>
          )}

          {selectedStructure && (
            <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs text-gray-300 space-y-1">
              <p>Pressione <kbd className="px-1 py-0.5 bg-gray-600 rounded text-white">R</kbd> para rotacionar</p>
              <p>Pressione <kbd className="px-1 py-0.5 bg-gray-600 rounded text-white">ESC</kbd> para cancelar</p>
            </div>
          )}

        {onOpenSaveLoad && (
          <Button
            onClick={onOpenSaveLoad}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
          >
            <Save size={16} />
            Salvar / Carregar
          </Button>
        )}
        </CardContent>
      </Card>
      )}
    </div>
  );
}