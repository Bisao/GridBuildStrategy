import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";

interface StructurePanelProps {
  selectedStructure: string | null;
  onSelectStructure: (structure: string | null) => void;
}

const StructurePanel = ({ selectedStructure, onSelectStructure }: StructurePanelProps) => {
  const structures = [
    {
      id: 'house',
      name: 'House',
      icon: Home,
      description: 'Basic residential building'
    }
  ];

  return (
    <div className="absolute top-4 left-4 z-10">
      <Card className="w-64 bg-gray-800/90 border-gray-600 text-white">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-center">
            Structure Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {structures.map((structure) => {
            const Icon = structure.icon;
            const isSelected = selectedStructure === structure.id;
            
            return (
              <Button
                key={structure.id}
                variant={isSelected ? "default" : "outline"}
                className={`w-full h-20 flex flex-col items-center justify-center gap-2 ${
                  isSelected 
                    ? "bg-blue-600 hover:bg-blue-700 border-blue-500" 
                    : "bg-gray-700 hover:bg-gray-600 border-gray-500 text-white"
                }`}
                onClick={() => onSelectStructure(isSelected ? null : structure.id)}
              >
                <Icon size={24} />
                <div className="text-center">
                  <div className="font-medium">{structure.name}</div>
                  <div className="text-xs opacity-75">{structure.description}</div>
                </div>
              </Button>
            );
          })}
          
          {selectedStructure && (
            <div className="text-center text-sm text-gray-300 mt-4 p-2 bg-gray-700/50 rounded">
              Click on a grid tile to place the selected structure
            </div>
          )}
          
          <Button
            variant="outline"
            className="w-full bg-red-600 hover:bg-red-700 border-red-500 text-white"
            onClick={() => onSelectStructure(null)}
            disabled={!selectedStructure}
          >
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StructurePanel;
