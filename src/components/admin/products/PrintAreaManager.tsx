
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash, Edit, Check, X } from "lucide-react";
import { PrintArea } from '@/types/product';

interface PrintAreaManagerProps {
  printAreas: PrintArea[];
  selectedAreaId: number | null;
  onSelectArea: (id: number) => void;
  onAddArea: (printArea: Omit<PrintArea, 'id'>) => void;
  onUpdateArea: (id: number, updatedData: Partial<PrintArea>) => void;
  onRemoveArea: (id: number) => void;
}

const PrintAreaManager: React.FC<PrintAreaManagerProps> = ({
  printAreas,
  selectedAreaId,
  onSelectArea,
  onAddArea,
  onUpdateArea,
  onRemoveArea
}) => {
  const defaultArea = {
    name: '',
    format: 'custom' as const,
    position: 'front' as 'front' | 'back',
    bounds: {
      x: 50,
      y: 50,
      width: 150,
      height: 150
    },
    allowCustomPosition: true
  };
  
  const [newArea, setNewArea] = useState<Omit<PrintArea, 'id'>>(defaultArea);
  const [isEditing, setIsEditing] = useState(false);
  const [editingArea, setEditingArea] = useState<PrintArea | null>(null);
  
  const handleAddArea = () => {
    if (!newArea.name.trim()) return;
    
    onAddArea(newArea);
    setNewArea(defaultArea);
  };
  
  const handleUpdateArea = () => {
    if (editingArea && editingArea.id !== undefined) {
      onUpdateArea(editingArea.id, editingArea);
      setIsEditing(false);
      setEditingArea(null);
    }
  };
  
  const handleSelectForEdit = (area: PrintArea) => {
    setEditingArea({...area});
    setIsEditing(true);
  };
  
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingArea(null);
  };
  
  const updateEditingAreaValue = (field: string, value: any) => {
    if (!editingArea) return;
    
    if (field.includes('.')) {
      // Handle nested fields like 'bounds.x'
      const [parent, child] = field.split('.');
      setEditingArea({
        ...editingArea,
        [parent]: {
          ...editingArea[parent as keyof PrintArea],
          [child]: value
        }
      });
    } else {
      setEditingArea({
        ...editingArea,
        [field]: value
      });
    }
  };
  
  const updateNewAreaValue = (field: string, value: any) => {
    if (field.includes('.')) {
      // Handle nested fields like 'bounds.x'
      const [parent, child] = field.split('.');
      setNewArea({
        ...newArea,
        [parent]: {
          ...newArea[parent as keyof typeof newArea],
          [child]: value
        }
      });
    } else {
      setNewArea({
        ...newArea,
        [field]: value
      });
    }
  };
  
  const frontAreas = printAreas.filter(area => area.position === 'front');
  const backAreas = printAreas.filter(area => area.position === 'back');
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Zones d'impression</h3>
      
      {/* Liste des zones existantes */}
      <div className="space-y-4">
        {/* Zones Recto */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Recto</h4>
          {frontAreas.length > 0 ? (
            <div className="space-y-2">
              {frontAreas.map(area => (
                <Card 
                  key={area.id} 
                  className={`p-3 flex justify-between ${selectedAreaId === area.id ? 'border-winshirt-purple bg-winshirt-purple/10' : 'border-gray-700'}`}
                  onClick={() => onSelectArea(area.id!)}
                >
                  <div>
                    <p className="font-medium">{area.name}</p>
                    <p className="text-xs text-gray-400">
                      {area.bounds.width}x{area.bounds.height} pixels
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectForEdit(area);
                      }}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveArea(area.id!);
                      }}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Aucune zone d'impression recto définie</p>
          )}
        </div>
        
        {/* Zones Verso */}
        <div>
          <h4 className="text-sm font-medium text-gray-400 mb-2">Verso</h4>
          {backAreas.length > 0 ? (
            <div className="space-y-2">
              {backAreas.map(area => (
                <Card 
                  key={area.id} 
                  className={`p-3 flex justify-between ${selectedAreaId === area.id ? 'border-winshirt-purple bg-winshirt-purple/10' : 'border-gray-700'}`}
                  onClick={() => onSelectArea(area.id!)}
                >
                  <div>
                    <p className="font-medium">{area.name}</p>
                    <p className="text-xs text-gray-400">
                      {area.bounds.width}x{area.bounds.height} pixels
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectForEdit(area);
                      }}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveArea(area.id!);
                      }}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Aucune zone d'impression verso définie</p>
          )}
        </div>
      </div>
      
      {/* Formulaire d'édition */}
      {isEditing ? (
        <Card className="p-4 border-winshirt-purple">
          <h4 className="font-medium mb-3">Modifier la zone d'impression</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-name">Nom</Label>
                <Input
                  id="edit-name"
                  value={editingArea?.name || ''}
                  onChange={(e) => updateEditingAreaValue('name', e.target.value)}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
              <div>
                <Label htmlFor="edit-position">Position</Label>
                <Select
                  value={editingArea?.position || 'front'}
                  onValueChange={(value) => updateEditingAreaValue('position', value)}
                >
                  <SelectTrigger id="edit-position" className="bg-winshirt-space-light border-winshirt-purple/30">
                    <SelectValue />
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
                <Label htmlFor="edit-x">Position X</Label>
                <Input
                  id="edit-x"
                  type="number"
                  value={editingArea?.bounds.x || 0}
                  onChange={(e) => updateEditingAreaValue('bounds.x', Number(e.target.value))}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
              <div>
                <Label htmlFor="edit-y">Position Y</Label>
                <Input
                  id="edit-y"
                  type="number"
                  value={editingArea?.bounds.y || 0}
                  onChange={(e) => updateEditingAreaValue('bounds.y', Number(e.target.value))}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="edit-width">Largeur</Label>
                <Input
                  id="edit-width"
                  type="number"
                  value={editingArea?.bounds.width || 0}
                  onChange={(e) => updateEditingAreaValue('bounds.width', Number(e.target.value))}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
              <div>
                <Label htmlFor="edit-height">Hauteur</Label>
                <Input
                  id="edit-height"
                  type="number"
                  value={editingArea?.bounds.height || 0}
                  onChange={(e) => updateEditingAreaValue('bounds.height', Number(e.target.value))}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Label htmlFor="edit-customPosition" className="cursor-pointer">
                Permettre le positionnement personnalisé
              </Label>
              <Switch
                id="edit-customPosition"
                checked={editingArea?.allowCustomPosition || false}
                onCheckedChange={(checked) => updateEditingAreaValue('allowCustomPosition', checked)}
                className="data-[state=checked]:bg-winshirt-purple"
              />
            </div>
            
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelEdit}
                className="border-winshirt-purple/30"
              >
                <X size={16} className="mr-1" /> Annuler
              </Button>
              <Button
                type="button"
                onClick={handleUpdateArea}
                className="bg-winshirt-purple hover:bg-winshirt-purple-dark"
              >
                <Check size={16} className="mr-1" /> Enregistrer
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Ajouter une zone d'impression</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={newArea.name}
                  onChange={(e) => updateNewAreaValue('name', e.target.value)}
                  placeholder="ex: Poitrine"
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Select
                  value={newArea.position}
                  onValueChange={(value) => updateNewAreaValue('position', value)}
                >
                  <SelectTrigger id="position" className="bg-winshirt-space-light border-winshirt-purple/30">
                    <SelectValue />
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
                <Label htmlFor="x">Position X</Label>
                <Input
                  id="x"
                  type="number"
                  value={newArea.bounds.x}
                  onChange={(e) => updateNewAreaValue('bounds.x', Number(e.target.value))}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
              <div>
                <Label htmlFor="y">Position Y</Label>
                <Input
                  id="y"
                  type="number"
                  value={newArea.bounds.y}
                  onChange={(e) => updateNewAreaValue('bounds.y', Number(e.target.value))}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="width">Largeur</Label>
                <Input
                  id="width"
                  type="number"
                  value={newArea.bounds.width}
                  onChange={(e) => updateNewAreaValue('bounds.width', Number(e.target.value))}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
              <div>
                <Label htmlFor="height">Hauteur</Label>
                <Input
                  id="height"
                  type="number"
                  value={newArea.bounds.height}
                  onChange={(e) => updateNewAreaValue('bounds.height', Number(e.target.value))}
                  className="bg-winshirt-space-light border-winshirt-purple/30"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-2">
              <Label htmlFor="customPosition" className="cursor-pointer">
                Permettre le positionnement personnalisé
              </Label>
              <Switch
                id="customPosition"
                checked={newArea.allowCustomPosition}
                onCheckedChange={(checked) => updateNewAreaValue('allowCustomPosition', checked)}
                className="data-[state=checked]:bg-winshirt-purple"
              />
            </div>
            
            <Button
              type="button"
              onClick={handleAddArea}
              className="bg-winshirt-purple hover:bg-winshirt-purple-dark mt-2 w-full"
              disabled={!newArea.name.trim()}
            >
              <Plus size={16} className="mr-1" /> Ajouter la zone
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PrintAreaManager;
