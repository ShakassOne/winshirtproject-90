
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { PrintArea } from '@/types/product';

interface PrintAreaManagerProps {
  printAreas: PrintArea[];
  onAddArea?: (printArea: PrintArea) => void;
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
    format: 'a4',
    position: 'front',
    bounds: { x: 0, y: 0, width: 200, height: 200 },
    allowCustomPosition: true
  });
  
  const handleAdd = () => {
    if (!newArea.name || !onAddArea) return;
    
    onAddArea({
      ...newArea,
      id: Date.now()
    });
    setIsAddingNew(false);
    setNewArea({
      name: '',
      format: 'a4',
      position: 'front',
      bounds: { x: 0, y: 0, width: 200, height: 200 },
      allowCustomPosition: true
    });
  };
  
  const handleCancel = () => {
    setIsAddingNew(false);
    setNewArea({
      name: '',
      format: 'a4',
      position: 'front',
      bounds: { x: 0, y: 0, width: 200, height: 200 },
      allowCustomPosition: true
    });
  };
  
  const handleUpdate = (id: number, field: string, value: any) => {
    if (!onUpdateArea) return;
    onUpdateArea(id, { [field]: value });
  };
  
  const handleFormatChange = (id: number, format: 'pocket' | 'a4' | 'a3' | 'custom') => {
    if (!onUpdateArea) return;
    
    // Définir les dimensions en fonction du format
    let newBounds = { x: 0, y: 0, width: 0, height: 0 };
    
    switch (format) {
      case 'pocket':
        newBounds = { x: 0, y: 0, width: 100, height: 100 };
        break;
      case 'a4':
        newBounds = { x: 0, y: 0, width: 210, height: 297 };
        break;
      case 'a3':
        newBounds = { x: 0, y: 0, width: 297, height: 420 };
        break;
      case 'custom':
        // Garder les dimensions actuelles ou définir des valeurs par défaut
        const currentArea = printAreas.find(area => area.id === id);
        newBounds = currentArea?.bounds || { x: 0, y: 0, width: 200, height: 200 };
        break;
    }
    
    onUpdateArea(id, { 
      format,
      bounds: newBounds
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Zones d'impression</h3>
      
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
              <label className="block text-xs text-gray-400 mb-1">Format</label>
              <Select 
                value={area.format}
                onValueChange={(value: 'pocket' | 'a4' | 'a3' | 'custom') => handleFormatChange(area.id, value)}
              >
                <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30" onClick={(e) => e.stopPropagation()}>
                  <SelectValue placeholder="Choisir un format" />
                </SelectTrigger>
                <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                  <SelectItem value="pocket">Pocket (petit)</SelectItem>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="a3">A3</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
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
            
            <div className="flex items-center">
              <input 
                type="checkbox"
                id={`custom-position-${area.id}`}
                checked={!!area.allowCustomPosition}
                onChange={(e) => {
                  e.stopPropagation();
                  handleUpdate(area.id, 'allowCustomPosition', e.target.checked);
                }}
                className="mr-2"
              />
              <label htmlFor={`custom-position-${area.id}`} className="text-sm">
                Le client peut repositionner
              </label>
            </div>
          </div>
          
          {area.format === 'custom' && (
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
          )}
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
                placeholder="ex: Poitrine, Dos, Manche..."
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-400 mb-1">Format</label>
              <Select 
                value={newArea.format}
                onValueChange={(value: 'pocket' | 'a4' | 'a3' | 'custom') => {
                  // Ajuster les dimensions selon le format
                  let newBounds = { x: 0, y: 0, width: 0, height: 0 };
                  
                  switch (value) {
                    case 'pocket':
                      newBounds = { x: 0, y: 0, width: 100, height: 100 };
                      break;
                    case 'a4':
                      newBounds = { x: 0, y: 0, width: 210, height: 297 };
                      break;
                    case 'a3':
                      newBounds = { x: 0, y: 0, width: 297, height: 420 };
                      break;
                    case 'custom':
                      newBounds = { x: 0, y: 0, width: 200, height: 200 };
                      break;
                  }
                  
                  setNewArea({...newArea, format: value, bounds: newBounds});
                }}
              >
                <SelectTrigger className="bg-winshirt-space-light border-winshirt-purple/30">
                  <SelectValue placeholder="Choisir un format" />
                </SelectTrigger>
                <SelectContent className="bg-winshirt-space border-winshirt-purple/30">
                  <SelectItem value="pocket">Pocket (petit)</SelectItem>
                  <SelectItem value="a4">A4</SelectItem>
                  <SelectItem value="a3">A3</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectItem value="front">Recto</SelectItem>
                  <SelectItem value="back">Verso</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox"
                id="new-custom-position"
                checked={newArea.allowCustomPosition}
                onChange={(e) => setNewArea({...newArea, allowCustomPosition: e.target.checked})}
                className="mr-2"
              />
              <label htmlFor="new-custom-position" className="text-sm">
                Le client peut repositionner
              </label>
            </div>
          </div>
          
          {newArea.format === 'custom' && (
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
          )}
          
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
      
      {!isAddingNew && (
        <Button 
          onClick={() => setIsAddingNew(true)}
          variant="outline" 
          className="mt-2 border-winshirt-purple text-winshirt-purple"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter une zone
        </Button>
      )}
    </div>
  );
};

export default PrintAreaManager;
