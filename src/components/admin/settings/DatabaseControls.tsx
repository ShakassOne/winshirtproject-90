
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Database, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';
import { clearAllData } from '@/lib/stripe';

const DatabaseControls = () => {
  const [isClearing, setIsClearing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  
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
      const isConnected = await checkSupabaseConnection();
      
      if (isConnected) {
        toast.success('Connexion à Supabase établie avec succès');
        
        // Vérifier les tables
        const { data, error } = await supabase
          .from('pg_tables')
          .select('tablename')
          .eq('schemaname', 'public');
          
        if (error) {
          toast.error('Erreur lors de la vérification des tables');
        } else {
          const tables = data.map(row => row.tablename).join(', ');
          toast.info(`Tables disponibles: ${tables}`);
        }
      } else {
        toast.error('Impossible de se connecter à Supabase');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue lors de la vérification de la connexion');
    } finally {
      setIsChecking(false);
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
