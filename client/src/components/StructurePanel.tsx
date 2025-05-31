import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";

interface StructurePanelProps {
  selectedStructure: string | null;
  onSelectStructure: (structure: string | null) => void;
}

export default function StructurePanel({ 
  selectedStructure, 
  onSelectStructure 
}: StructurePanelProps) {
  return (
    <div className="fixed top-2 left-2 z-10 sm:top-4 sm:left-4">
      <Card className="w-48 sm:w-64 bg-gray-800/90 border-gray-700 backdrop-blur-sm">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-white text-sm sm:text-lg">Estruturas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-0">
          <Button
            variant={selectedStructure === 'house' ? 'default' : 'outline'}
            className={`w-full justify-start text-xs sm:text-sm h-8 sm:h-10 ${
              selectedStructure === 'house' 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => onSelectStructure('house')}
          >
            <Home className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Casa
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}