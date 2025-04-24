
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  AlertTriangle, 
  Trash2, 
  CheckCircle, 
  RefreshCw, 
  Loader2,
  FileJson,
  HardDrive,
  Upload,
  Download
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { clearAllData } from '@/lib/stripe';
import { supabase } from '@/integrations/supabase/client';
import { useSyncData } from '@/hooks/useSyncData';

const DatabaseControls = () => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const { checkConnection, syncAllToSupabase } = useSyncData();

  // Vérifier la connexion à Supabase
  const verifyConnection = async () => {
    setIsLoading(true);
    const connected = await checkConnection();
    setIsConnected(connected);
    if (connected) {
      toast.success("Connecté à Supabase");
    } else {
      toast.error("Impossible de se connecter à Supabase");
    }
    setIsLoading(false);
  };

  // Exporter une sauvegarde des données
  const exportData = () => {
    try {
      const tables = [
        'lotteries',
        'lottery_participants',
        'lottery_winners',
        'products',
        'visuals',
        'orders',
        'order_items',
        'clients',
        'site_settings'
      ];
      
      const data = tables.reduce((acc, table) => {
        const tableData = localStorage.getItem(table);
        return { 
          ...acc, 
          [table]: tableData ? JSON.parse(tableData) : [] 
        };
      }, {});
      
      // Créer un fichier blob et le télécharger
      const dataStr = JSON.stringify(data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      a.setAttribute('href', url);
      a.setAttribute('download', `winshirt-backup-${timestamp}.json`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("Sauvegarde exportée avec succès");
    } catch (error) {
      console.error("Erreur lors de l'exportation des données:", error);
      toast.error("Erreur lors de l'exportation des données");
    }
  };

  // Importer une sauvegarde des données
  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
      try {
        if (!e.target) return;
        const inputElement = e.target as HTMLInputElement;
        
        if (inputElement.files && inputElement.files.length > 0) {
          setIsLoading(true);
          const file = inputElement.files[0];
          const text = await file.text();
          const data = JSON.parse(text);
          
          // Vérifier si le format est valide
          if (typeof data !== 'object') {
            throw new Error("Format de fichier invalide");
          }
          
          // Importer les données dans localStorage
          Object.keys(data).forEach(table => {
            if (Array.isArray(data[table])) {
              localStorage.setItem(table, JSON.stringify(data[table]));
            }
          });
          
          toast.success("Données importées avec succès");
          
          // Si connecté à Supabase, proposer de synchroniser
          if (await checkConnection()) {
            const confirmSync = window.confirm(
              "Voulez-vous synchroniser ces données avec Supabase maintenant ?"
            );
            
            if (confirmSync) {
              await syncAllToSupabase();
              toast.success("Données synchronisées avec Supabase");
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors de l'importation des données:", error);
        toast.error(`Erreur lors de l'importation: ${error instanceof Error ? error.message : 'Format invalide'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    input.click();
  };

  // Réinitialiser toutes les données
  const handleClearAllData = async () => {
    try {
      setIsLoading(true);
      setIsConfirmDialogOpen(false);
      
      const success = await clearAllData();
      
      if (success) {
        toast.success("Toutes les données ont été supprimées avec succès");
        // Recharger la page pour actualiser l'affichage
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error("Erreur lors de la suppression des données");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression des données:", error);
      toast.error("Erreur lors de la suppression des données");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="winshirt-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Database className="h-5 w-5" />
            Base de données et sauvegarde
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Statut de la connexion */}
          <div className="flex items-center justify-between p-4 bg-winshirt-space-light rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                isConnected === null ? 'bg-gray-500' : 
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-white font-medium">
                {isConnected === null ? 'Statut de connexion inconnu' : 
                 isConnected ? 'Connecté à Supabase' : 'Non connecté à Supabase'}
              </span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={verifyConnection}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Vérifier</span>
            </Button>
          </div>
          
          <Separator className="my-4 bg-gray-700/30" />
          
          {/* Sauvegarde et restauration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              className="bg-gray-700 hover:bg-gray-600 flex items-center gap-2 justify-start px-4 py-6"
              onClick={() => setIsBackupDialogOpen(true)}
              disabled={isLoading}
            >
              <HardDrive className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Sauvegarde & restauration</div>
                <div className="text-xs opacity-70">Gérer vos sauvegardes de données</div>
              </div>
            </Button>
            
            <Button 
              variant="destructive"
              className="flex items-center gap-2 justify-start px-4 py-6"
              onClick={() => setIsConfirmDialogOpen(true)}
              disabled={isLoading}
            >
              <Trash2 className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Réinitialiser les données</div>
                <div className="text-xs opacity-70">Supprimer toutes les données</div>
              </div>
            </Button>
          </div>
          
          <Alert className="bg-yellow-950/30 border border-yellow-500/50 mt-6">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-200 text-sm">
              La réinitialisation des données effacera définitivement toutes les informations 
              stockées dans votre base de données et dans le stockage local du navigateur. 
              Assurez-vous d'exporter une sauvegarde avant de procéder.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
      
      {/* Dialogue de confirmation pour la suppression */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent className="winshirt-card border-red-500/30">
          <DialogHeader>
            <DialogTitle className="text-red-400">Confirmer la réinitialisation</DialogTitle>
            <DialogDescription className="text-gray-400 pt-2">
              Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action supprimera définitivement :
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Toutes les loteries et leurs participants</li>
                <li>Tous les produits</li>
                <li>Toutes les commandes</li>
                <li>Tous les clients</li>
                <li>Tous les visuels</li>
                <li>Tous les paramètres du site</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:justify-between">
            <Button variant="ghost" onClick={() => setIsConfirmDialogOpen(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleClearAllData} 
              className="w-full sm:w-auto"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Suppression en cours...</>
              ) : (
                <><Trash2 className="h-4 w-4 mr-2" /> Tout supprimer</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialogue de sauvegarde et restauration */}
      <Dialog open={isBackupDialogOpen} onOpenChange={setIsBackupDialogOpen}>
        <DialogContent className="winshirt-card">
          <DialogHeader>
            <DialogTitle>Sauvegarde et restauration</DialogTitle>
            <DialogDescription className="text-gray-400 pt-2">
              Exportez vos données pour les sauvegarder ou importez une sauvegarde existante.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <Button 
              className="flex flex-col items-center justify-center gap-3 h-32"
              onClick={exportData}
              disabled={isLoading}
              variant="outline"
            >
              <Download className="h-10 w-10 text-winshirt-blue" />
              <div className="text-center">
                <div className="font-medium">Exporter les données</div>
                <div className="text-xs text-gray-400">Télécharger un fichier JSON</div>
              </div>
            </Button>
            
            <Button 
              className="flex flex-col items-center justify-center gap-3 h-32"
              onClick={importData}
              disabled={isLoading}
              variant="outline"
            >
              <Upload className="h-10 w-10 text-winshirt-purple" />
              <div className="text-center">
                <div className="font-medium">Importer une sauvegarde</div>
                <div className="text-xs text-gray-400">Charger un fichier JSON</div>
              </div>
            </Button>
          </div>
          
          <Alert className="bg-blue-950/30 border border-blue-500/50 mt-2">
            <FileJson className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-200 text-sm">
              Les fichiers de sauvegarde contiennent toutes vos données dans un format JSON.
              Lors de l'importation, vous aurez la possibilité de synchroniser les données avec Supabase.
            </AlertDescription>
          </Alert>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsBackupDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DatabaseControls;
