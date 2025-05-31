import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Home, X, Settings, Castle, Hammer, ShoppingCart, Menu, Save } from "lucide-react";
import { useEffect } from "react";

interface StructurePanelProps {
  selectedStructure: string | null;
  onSelectStructure: (structure: string | null) => void;
  isOpen: boolean;
  onToggle: () => void;
  onOpenSaveLoad?: () => void;
}

export default function StructurePanel({ 
  selectedStructure, 
  onSelectStructure,
  isOpen,
  onToggle,
  onOpenSaveLoad
}: StructurePanelProps) {
  // Handle ESC key to close panel
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onToggle();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isOpen, onToggle]);

  return (
    <div className="fixed top-2 left-2 z-10 sm:top-4 sm:left-4">
      {/* Toggle Button */}
      <Button
        onClick={onToggle}
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


        <Button
          variant={selectedStructure === 'largehouse' ? 'default' : 'outline'}
          className={`w-full justify-start text-xs sm:text-sm h-8 sm:h-10 ${
            selectedStructure === 'largehouse' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'border-gray-600 text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => onSelectStructure('largehouse')}
        >
          <Home className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Casa Grande
        </Button>

        <Button
          variant={selectedStructure === 'windmill' ? 'default' : 'outline'}
          className={`w-full justify-start text-xs sm:text-sm h-8 sm:h-10 ${
            selectedStructure === 'windmill' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'border-gray-600 text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => onSelectStructure('windmill')}
        >
          <Settings className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Moinho
        </Button>

        <Button
          variant={selectedStructure === 'tower' ? 'default' : 'outline'}
          className={`w-full justify-start text-xs sm:text-sm h-8 sm:h-10 ${
            selectedStructure === 'tower' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'border-gray-600 text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => onSelectStructure('tower')}
        >
          <Castle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Torre
        </Button>

        <Button
          variant={selectedStructure === 'blacksmith' ? 'default' : 'outline'}
          className={`w-full justify-start text-xs sm:text-sm h-8 sm:h-10 ${
            selectedStructure === 'blacksmith' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'border-gray-600 text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => onSelectStructure('blacksmith')}
        >
          <Hammer className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Ferraria
        </Button>

        <Button
          variant={selectedStructure === 'market' ? 'default' : 'outline'}
          className={`w-full justify-start text-xs sm:text-sm h-8 sm:h-10 ${
            selectedStructure === 'market' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'border-gray-600 text-gray-300 hover:bg-gray-700'
          }`}
          onClick={() => onSelectStructure('market')}
        >
          <ShoppingCart className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
          Mercado
        </Button>

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