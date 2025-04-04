
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { PrintArea } from '@/types/product';

interface PrintAreaManagerProps {
  printAreas: PrintArea[];
  onAddArea?: (printArea: Omit<PrintArea, 'id'>) => void;
  onRemoveArea?: (id: number) => void;
  onUpdateArea?: (id: number, updates: Partial<PrintArea>) => void;
  selectedAreaId?: number | null;
  onSelectArea?: (id: number) => void;
}

const PrintAreaManager: React.FC<PrintAreaManagerProps> = ({ 
  printAreas,
  onAddArea,
  onRemoveArea,
  onUpdateArea,
  selectedAreaId,
  onSelectArea
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newArea, setNewArea] = useState<Omit<PrintArea, 'id'>>({
    name: '',
    position: 'front',
    format: 'custom', // Toujours format personnalisé
    bounds: { x: 0, y: 0, width: 200, height: 200 },
    allowCustomPosition: true
  });

  // Vérifiez si un recto et un verso existent déjà
  const hasFrontArea = printAreas.some(area => area.position === 'front');
  const hasBackArea = printAreas.some(area => area.position === 'back');
  
  const handleAdd = () => {
    if (!newArea.name || !onAddArea) return;
    
    onAddArea({
      ...newArea,
      format: 'custom' as const // Utiliser as const pour garantir le type littéral
    });
    setIsAddingNew(false);
    setNewArea({
      name: '',
      position: 'front',
      format: 'custom',
      bounds: { x: 0, y: 0, width: 200, height: 200 },
      allowCustomPosition: true
    });
  };
  
  const handleCancel = () => {
    setIsAddingNew(false);
    setNewArea({
      name: '',
      position: 'front',
      format: 'custom',
      bounds: { x: 0, y: 0, width: 200, height: 200 },
      allowCustomPosition: true
    });
  };
  
  const handleUpdate = (id: number, field: string, value: any) => {
    if (!onUpdateArea) return;
    
    if (field === 'bounds') {
      onUpdateArea(id, { bounds: value });
    } else {
      onUpdateArea(id, { [field]: value });
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Zones d'impression</h3>
      <p className="text-sm text-gray-400">
        Définissez une zone d'impression pour le recto et une pour le verso du produit.
      </p>
      
      {printAreas.length === 0 && !isAddingNew && (
        <div className="text-center p-4 border border-dashed border-gray-500 rounded-md">
          <p className="text-gray-400 mb-2">Aucune zone d'impression définie</p>
          <Button 
            onClick={() => setIsAddingNew(true)}
            variant="outline" 
            className="border-winshirt-purple text-winshirt-purple"
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter une zone
          </Button>
        </div>
      )}
      
      {printAreas.map(area => (
        <div 
          key={area.id} 
          className={`border ${selectedAreaId === area.id ? 'border-winshirt-purple' : 'border-gray-700'} rounded-md p-4 space-y-3`}
          onClick={() => onSelectArea && onSelectArea(area.id)}
        >
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{area.name}</h4>
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                onRemoveArea && onRemoveArea(area.id);
              }}
              variant="ghost" 
              size="sm"
              className="text-red-400 hover:text-red-300 h-8 px-2"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nom de la zone</label>
              <Input 
                value={area.name}
                onChange={(e) => handleUpdate(area.id, 'name', e.target.value)}
                className="bg-winshirt-space-light border-winshirt-purple/30"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Position</label>
              <Select 
                value={area.position}
                onValueChange={(value: 'front' | 'back') => handleUpdate(area.id, 'position', value)}
              >
                <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30" onClick={(e) => e.stopPropagation()}>
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                  <SelectItem value="front">Recto</SelectItem>
                  <SelectItem value="back">Verso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Largeur</label>
              <Input 
                type="number"
                value={area.bounds.width}
                onChange={(e) => handleUpdate(area.id, 'bounds', { ...area.bounds, width: Number(e.target.value) })}
                className="bg-winshirt-space-light border-winshirt-purple/30"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hauteur</label>
              <Input 
                type="number"
                value={area.bounds.height}
                onChange={(e) => handleUpdate(area.id, 'bounds', { ...area.bounds, height: Number(e.target.value) })}
                className="bg-winshirt-space-light border-winshirt-purple/30"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      ))}
      
      {/* Formulaire d'ajout */}
      {isAddingNew && (
        <div className="border border-gray-700 rounded-md p-4 space-y-3">
          <h4 className="font-medium">Nouvelle zone d'impression</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nom de la zone</label>
              <Input 
                value={newArea.name}
                onChange={(e) => setNewArea({...newArea, name: e.target.value})}
                className="bg-winshirt-space-light border-winshirt-purple/30"
                placeholder="ex: Recto, Verso..."
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Position</label>
              <Select 
                value={newArea.position}
                onValueChange={(value: 'front' | 'back') => setNewArea({...newArea, position: value})}
              >
                <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                  <SelectItem value="front" disabled={hasFrontArea}>Recto</SelectItem>
                  <SelectItem value="back" disabled={hasBackArea}>Verso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Largeur</label>
              <Input 
                type="number"
                value={newArea.bounds.width}
                onChange={(e) => setNewArea({...newArea, bounds: {...newArea.bounds, width: Number(e.target.value)}})}
                className="bg-winshirt-space-light border-winshirt-purple/30"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Hauteur</label>
              <Input 
                type="number"
                value={newArea.bounds.height}
                onChange={(e) => setNewArea({...newArea, bounds: {...newArea.bounds, height: Number(e.target.value)}})}
                className="bg-winshirt-space-light border-winshirt-purple/30"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="ghost"
              onClick={handleCancel}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAdd}
              disabled={!newArea.name}
              className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
            >
              Ajouter
            </Button>
          </div>
        </div>
      )}
      
      {!isAddingNew && printAreas.length < 2 && (
        <Button 
          onClick={() => setIsAddingNew(true)}
          variant="outline" 
          className="mt-2 border-winshirt-purple text-winshirt-purple"
          disabled={printAreas.length >= 2}
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une zone {printAreas.length === 1 ? (printAreas[0].position === 'front' ? "(Verso)" : "(Recto)") : ""}
        </Button>
      )}
    </div>
  );
};

export default PrintAreaManager;
