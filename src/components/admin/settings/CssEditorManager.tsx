import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/lib/toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaintBucket, Code, Save, Undo, RefreshCw, ArrowUpDown, Check } from 'lucide-react';

interface CssVariable {
  name: string;
  value: string;
  originalValue: string;
  description: string;
  category: 'colors' | 'spacing' | 'typography' | 'other';
}

const CssEditorManager: React.FC = () => {
  const [cssVariables, setCssVariables] = useState<CssVariable[]>([]);
  const [activeTab, setActiveTab] = useState<string>('colors');
  const [isChanged, setIsChanged] = useState(false);
  
  // Load CSS variables on component mount
  useEffect(() => {
    loadCssVariables();
  }, []);
  
  const loadCssVariables = () => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const winshirtVariables: CssVariable[] = [
      { name: '--winshirt-space', value: computedStyle.getPropertyValue('--winshirt-space').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-space').trim(), description: 'Couleur de fond principale', category: 'colors' },
      { name: '--winshirt-space-light', value: computedStyle.getPropertyValue('--winshirt-space-light').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-space-light').trim(), description: 'Couleur de fond secondaire', category: 'colors' },
      { name: '--winshirt-space-dark', value: computedStyle.getPropertyValue('--winshirt-space-dark').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-space-dark').trim(), description: 'Couleur de fond sombre', category: 'colors' },
      { name: '--winshirt-purple', value: computedStyle.getPropertyValue('--winshirt-purple').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-purple').trim(), description: 'Couleur principale', category: 'colors' },
      { name: '--winshirt-purple-light', value: computedStyle.getPropertyValue('--winshirt-purple-light').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-purple-light').trim(), description: 'Couleur principale claire', category: 'colors' },
      { name: '--winshirt-purple-dark', value: computedStyle.getPropertyValue('--winshirt-purple-dark').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-purple-dark').trim(), description: 'Couleur principale foncée', category: 'colors' },
      { name: '--winshirt-blue', value: computedStyle.getPropertyValue('--winshirt-blue').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-blue').trim(), description: 'Couleur secondaire', category: 'colors' },
      { name: '--winshirt-blue-light', value: computedStyle.getPropertyValue('--winshirt-blue-light').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-blue-light').trim(), description: 'Couleur secondaire claire', category: 'colors' },
      { name: '--winshirt-blue-dark', value: computedStyle.getPropertyValue('--winshirt-blue-dark').trim(), originalValue: computedStyle.getPropertyValue('--winshirt-blue-dark').trim(), description: 'Couleur secondaire foncée', category: 'colors' },
      
      // Typography variables
      { name: '--font-size-base', value: '1rem', originalValue: '1rem', description: 'Taille de police de base', category: 'typography' },
      { name: '--font-size-lg', value: '1.125rem', originalValue: '1.125rem', description: 'Grande taille de police', category: 'typography' },
      { name: '--font-size-xl', value: '1.25rem', originalValue: '1.25rem', description: 'Très grande taille de police', category: 'typography' },
      { name: '--font-size-2xl', value: '1.5rem', originalValue: '1.5rem', description: 'Taille de titre', category: 'typography' },
      { name: '--font-weight-normal', value: '400', originalValue: '400', description: 'Poids de police normal', category: 'typography' },
      { name: '--font-weight-medium', value: '500', originalValue: '500', description: 'Poids de police moyen', category: 'typography' },
      { name: '--font-weight-bold', value: '700', originalValue: '700', description: 'Poids de police gras', category: 'typography' },
      
      // Spacing variables
      { name: '--spacing-xs', value: '0.25rem', originalValue: '0.25rem', description: 'Espacement très petit', category: 'spacing' },
      { name: '--spacing-sm', value: '0.5rem', originalValue: '0.5rem', description: 'Espacement petit', category: 'spacing' },
      { name: '--spacing-md', value: '1rem', originalValue: '1rem', description: 'Espacement moyen', category: 'spacing' },
      { name: '--spacing-lg', value: '1.5rem', originalValue: '1.5rem', description: 'Espacement grand', category: 'spacing' },
      { name: '--spacing-xl', value: '2rem', originalValue: '2rem', description: 'Espacement très grand', category: 'spacing' },
      { name: '--radius-sm', value: '0.25rem', originalValue: '0.25rem', description: 'Rayon des coins petit', category: 'spacing' },
      { name: '--radius-md', value: '0.5rem', originalValue: '0.5rem', description: 'Rayon des coins moyen', category: 'spacing' },
      { name: '--radius-lg', value: '0.75rem', originalValue: '0.75rem', description: 'Rayon des coins grand', category: 'spacing' },
      
      // Other UI variables
      { name: '--shadow-sm', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', originalValue: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', description: 'Ombre légère', category: 'other' },
      { name: '--shadow-md', value: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', originalValue: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', description: 'Ombre moyenne', category: 'other' },
      { name: '--shadow-lg', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', originalValue: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', description: 'Ombre grande', category: 'other' },
      { name: '--transition-base', value: '0.2s ease-in-out', originalValue: '0.2s ease-in-out', description: 'Transition de base', category: 'other' },
    ];
    
    setCssVariables(winshirtVariables);
  };
  
  const handleInputChange = (index: number, value: string) => {
    const updatedVariables = [...cssVariables];
    updatedVariables[index].value = value;
    setCssVariables(updatedVariables);
    
    // Check if any variable has been changed from its original value
    const hasChanges = updatedVariables.some(v => v.value !== v.originalValue);
    setIsChanged(hasChanges);
  };
  
  const saveCssChanges = () => {
    try {
      const root = document.documentElement;
      
      // Apply CSS changes
      cssVariables.forEach(variable => {
        root.style.setProperty(variable.name, variable.value);
      });
      
      // Save to localStorage for persistence
      const cssSettings = cssVariables.reduce((acc: Record<string, string>, variable) => {
        acc[variable.name] = variable.value;
        return acc;
      }, {});
      
      localStorage.setItem('winshirt-css-settings', JSON.stringify(cssSettings));
      
      // Update the original values
      setCssVariables(cssVariables.map(variable => ({
        ...variable,
        originalValue: variable.value
      })));
      
      setIsChanged(false);
      toast.success("Les modifications CSS ont été appliquées");
    } catch (error) {
      console.error('Error saving CSS changes:', error);
      toast.error("Erreur lors de l'application des modifications CSS");
    }
  };
  
  const resetToDefault = () => {
    const root = document.documentElement;
    
    // Reset to default values from App.tsx
    root.style.setProperty('--winshirt-space', '#0c1019');
    root.style.setProperty('--winshirt-space-light', '#151b27');
    root.style.setProperty('--winshirt-space-dark', '#080c12');
    root.style.setProperty('--winshirt-purple', '#7c3aed');
    root.style.setProperty('--winshirt-purple-light', '#9869f5');
    root.style.setProperty('--winshirt-purple-dark', '#6026c5');
    root.style.setProperty('--winshirt-blue', '#3a86ff');
    root.style.setProperty('--winshirt-blue-light', '#66a3ff');
    root.style.setProperty('--winshirt-blue-dark', '#2e6acd');
    
    // Remove from localStorage
    localStorage.removeItem('winshirt-css-settings');
    
    // Reload variables
    loadCssVariables();
    setIsChanged(false);
    toast.success("Réinitialisation des styles par défaut");
  };
  
  const resetCurrentChanges = () => {
    setCssVariables(cssVariables.map(variable => ({
      ...variable,
      value: variable.originalValue
    })));
    setIsChanged(false);
    toast.info("Modifications annulées");
  };
  
  // Filter variables by category
  const filteredVariables = cssVariables.filter(variable => variable.category === activeTab);
  
  return (
    <Card className="winshirt-card">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <PaintBucket className="h-5 w-5" />
          Éditeur de styles CSS
        </CardTitle>
        <CardDescription>
          Personnalisez les couleurs et autres variables CSS de votre site
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={saveCssChanges}
              disabled={!isChanged}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
            
            <Button
              size="sm"
              onClick={resetCurrentChanges}
              disabled={!isChanged}
              variant="outline"
              className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
            >
              <Undo className="mr-2 h-4 w-4" />
              Annuler
            </Button>
            
            <Button
              size="sm"
              onClick={resetToDefault}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="colors">Couleurs</TabsTrigger>
              <TabsTrigger value="typography">Typographie</TabsTrigger>
              <TabsTrigger value="spacing">Espacement</TabsTrigger>
              <TabsTrigger value="other">Autres</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {filteredVariables.map((variable, index) => {
                    const actualIndex = cssVariables.findIndex(v => v.name === variable.name);
                    const hasChanged = variable.value !== variable.originalValue;
                    
                    return (
                      <div 
                        key={variable.name} 
                        className={`p-3 rounded-lg transition-colors ${hasChanged ? 'bg-winshirt-purple/20 border border-winshirt-purple/40' : 'bg-winshirt-space-light'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Label 
                            htmlFor={`css-var-${index}`}
                            className={`flex items-center text-sm ${hasChanged ? 'text-winshirt-purple-light' : 'text-gray-300'}`}
                          >
                            {hasChanged && <Check className="mr-1 h-3 w-3 text-green-500" />}
                            {variable.name}
                          </Label>
                          <span className="text-xs text-gray-400">{variable.description}</span>
                        </div>
                        
                        {variable.category === 'colors' ? (
                          <div className="flex gap-3">
                            <div 
                              className="w-10 h-10 rounded border border-gray-600" 
                              style={{ background: variable.value }}
                            />
                            <Input
                              id={`css-var-${index}`}
                              type="text"
                              value={variable.value}
                              onChange={(e) => handleInputChange(actualIndex, e.target.value)}
                              className="bg-winshirt-space border-winshirt-purple/30 flex-1"
                            />
                          </div>
                        ) : (
                          <Input
                            id={`css-var-${index}`}
                            type="text"
                            value={variable.value}
                            onChange={(e) => handleInputChange(actualIndex, e.target.value)}
                            className="bg-winshirt-space border-winshirt-purple/30 w-full"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          
          {isChanged && (
            <div className="bg-winshirt-purple/20 p-3 rounded-lg border border-winshirt-purple/30 text-sm">
              <div className="flex items-center text-winshirt-purple-light mb-2">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <span className="font-medium">Changements en attente</span>
              </div>
              <p className="text-gray-300">
                Cliquez sur "Enregistrer" pour appliquer vos modifications ou "Annuler" pour revenir aux valeurs précédentes.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CssEditorManager;
