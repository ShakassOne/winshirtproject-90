
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Database, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { supabase } from '@/integrations/supabase/client';
import { clearAllData } from '@/lib/stripe';
import { syncAllTablesToSupabase, checkSupabaseConnection } from '@/api/syncApi';

const DatabaseControls = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleClearAllData = async () => {
    if (!confirm('ATTENTION: Cette action va supprimer TOUTES les données de la base. Cette opération est irréversible. Êtes-vous sûr de vouloir continuer ?')) {
      return;
    }
    
    try {
      setIsClearing(true);
      const success = await clearAllData();
      if (success) {
        toast.success('Toutes les données ont été supprimées avec succès');
      } else {
        toast.error('Erreur lors de la suppression des données');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue lors de la suppression des données');
    } finally {
      setIsClearing(false);
    }
  };
  
  const handleCheckConnection = async () => {
    try {
      setIsChecking(true);
      
      // Test direct connection to Supabase
      const { data, error } = await supabase.from('pg_tables').select('*').limit(1);
      
      if (error) {
        console.error("Erreur de connexion à Supabase:", error);
        toast.error(`Erreur de connexion: ${error.message}`);
        return;
      }
      
      toast.success('Connexion à Supabase établie avec succès');
      
      // Vérifier les tables
      const { data: tableData, error: tableError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
          
      if (tableError) {
        toast.error('Erreur lors de la vérification des tables');
      } else {
        const tables = tableData.map(row => row.tablename).join(', ');
        toast.info(`Tables disponibles: ${tables}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue lors de la vérification de la connexion');
    } finally {
      setIsChecking(false);
    }
  };
  
  const handleSyncAllData = async () => {
    try {
      setIsSyncing(true);
      const success = await syncAllTablesToSupabase();
      
      if (success) {
        toast.success('Toutes les données ont été synchronisées avec succès');
      } else {
        toast.warning('Certaines tables n\'ont pas pu être synchronisées');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue lors de la synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };
  
  return (
    <Card className="winshirt-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Database className="h-5 w-5" /> 
          Gestion de la base de données
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleCheckConnection}
            disabled={isChecking}
          >
            <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Vérification...' : 'Vérifier la connexion Supabase'}
          </Button>
          
          <div className="text-sm text-gray-400 mt-1">
            Vérifie la connexion à Supabase et liste les tables disponibles
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            variant="secondary"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={handleSyncAllData}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Synchronisation en cours...' : 'Synchroniser toutes les données vers Supabase'}
          </Button>
          
          <div className="text-sm text-gray-400 mt-1">
            Transfère toutes les données du stockage local vers Supabase
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            variant="destructive" 
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
            onClick={handleClearAllData}
            disabled={isClearing}
          >
            <Trash2 className="h-4 w-4" />
            {isClearing ? 'Suppression en cours...' : 'Supprimer toutes les données'}
          </Button>
          
          <div className="flex items-start gap-2 mt-1 p-2 bg-red-900/20 border border-red-500/30 rounded-md">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
            <p className="text-sm text-red-300">
              ATTENTION: Cette action va supprimer toutes les données des tables dans Supabase. Cette opération est irréversible.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseControls;
