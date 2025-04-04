
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Upload, FileJson } from "lucide-react";
import { toast } from '@/lib/toast';
import { Visual } from '@/types/visual';

interface VisualsImportExportProps {
  visuals: Visual[];
  onVisualsImport: (importedVisuals: Visual[]) => void;
}

const VisualsImportExport: React.FC<VisualsImportExportProps> = ({ 
  visuals, 
  onVisualsImport 
}) => {
  // Export visuals to JSON file
  const handleExportVisuals = () => {
    try {
      const dataStr = JSON.stringify(visuals, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `winshirt-visuals-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast.success("Visuels exportés avec succès");
    } catch (error) {
      console.error("Erreur lors de l'exportation des visuels:", error);
      toast.error("Erreur lors de l'exportation des visuels");
    }
  };
  
  // Import visuals from JSON file
  const handleImportVisuals = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedVisuals = JSON.parse(event.target?.result as string);
          
          if (Array.isArray(importedVisuals)) {
            onVisualsImport(importedVisuals);
            toast.success(`${importedVisuals.length} visuels importés avec succès`);
            
            // Synchroniser avec le localStorage
            localStorage.setItem('visuals', JSON.stringify(importedVisuals));
            
            // Événement personnalisé pour notifier d'autres parties de l'application
            window.dispatchEvent(new CustomEvent('visualsUpdated', { 
              detail: { visuals: importedVisuals } 
            }));
          } else {
            toast.error("Format de fichier invalide. Attendu: tableau de visuels");
          }
        } catch (error) {
          console.error("Erreur lors de l'importation:", error);
          toast.error("Erreur lors de l'importation des visuels");
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <div className="flex gap-3">
      <Button 
        onClick={handleExportVisuals}
        className="bg-winshirt-blue hover:bg-winshirt-blue-dark"
      >
        <Download size={16} className="mr-2" /> Exporter
      </Button>
      <Button 
        onClick={handleImportVisuals}
        variant="outline"
        className="border-winshirt-purple text-winshirt-purple hover:bg-winshirt-purple/10"
      >
        <Upload size={16} className="mr-2" /> Importer
      </Button>
    </div>
  );
};

export default VisualsImportExport;
