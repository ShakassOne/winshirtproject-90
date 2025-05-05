import React, { useState, useEffect } from 'react';
import { toast } from '@/lib/toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  syncLotteriesToSupabase,
  syncProductsToSupabase,
  useLotteries,
  useProducts,
} from '@/services/productService';
import { syncVisualsToSupabase, syncVisualCategoriesToSupabase } from '@/api/visualApi';
import { useVisualCategories } from '@/services/visualCategoryService';
import { getDataCounts } from '@/lib/syncManager';
import { checkSupabaseConnection, checkTableExists, requiredTables } from '@/integrations/supabase/client';
import { Database } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';
import { ValidTableName } from '@/integrations/supabase/client';

const AdminSyncPage: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [tableStatuses, setTableStatuses] = useState<Record<ValidTableName, boolean>>({
    lotteries: false,
    products: false,
    clients: false,
    orders: false,
    order_items: false,
    lottery_participants: false,
    lottery_winners: false,
    visuals: false,
    visual_categories: false,
    user_roles: false
  });
  const [dataCounts, setDataCounts] = useState<Record<ValidTableName, number>>({
    lotteries: 0,
    products: 0,
    clients: 0,
    orders: 0,
    order_items: 0,
    lottery_participants: 0,
    lottery_winners: 0,
    visuals: 0,
    visual_categories: 0,
    user_roles: 0
  });
  const [apiKey, setApiKey] = useState('');
  const [url, setUrl] = useState('');

  useEffect(() => {
    const checkConnectionAndTables = async () => {
      // Check Supabase connection
      const isConnected = await checkSupabaseConnection();
      setSupabaseStatus(isConnected ? 'connected' : 'disconnected');

      // Check table existence
      const tableChecks: Partial<Record<ValidTableName, boolean>> = {};
      for (const tableName of requiredTables) {
        tableChecks[tableName] = await checkTableExists(tableName);
      }
      setTableStatuses(tableChecks as Record<ValidTableName, boolean>);
    };

    checkConnectionAndTables();
  }, []);

  useEffect(() => {
    const fetchDataCounts = async () => {
      const counts = await getDataCounts();
      setDataCounts(counts);
    };

    fetchDataCounts();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Sync all data to Supabase
      const syncLotteries = await syncLotteriesToSupabase();
      const syncProducts = await syncProductsToSupabase();
      const syncVisuals = await syncVisualsToSupabase();
      const syncVisualCategories = await syncVisualCategoriesToSupabase();

      if (syncLotteries && syncProducts && syncVisuals && syncVisualCategories) {
        toast.success('Toutes les données ont été synchronisées avec succès!');
      } else {
        toast.error('Erreur lors de la synchronisation des données. Veuillez vérifier les détails.');
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      toast.error('Erreur lors de la synchronisation des données.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Synchronisation des données</h1>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-lg font-semibold">État de la connexion Supabase</h2>
        </CardHeader>
        <CardContent>
          {supabaseStatus === 'checking' && <p>Vérification de la connexion...</p>}
          {supabaseStatus === 'connected' && <p className="text-green-500">Connecté à Supabase</p>}
          {supabaseStatus === 'disconnected' && <p className="text-red-500">Déconnecté de Supabase</p>}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-lg font-semibold">État des tables Supabase</h2>
        </CardHeader>
        <CardContent>
          {Object.entries(tableStatuses).map(([tableName, exists]) => (
            <p key={tableName}>
              {tableName}: {exists ? <span className="text-green-500">Existe</span> : <span className="text-red-500">N'existe pas</span>}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-lg font-semibold">Nombre de données locales</h2>
        </CardHeader>
        <CardContent>
          {Object.entries(dataCounts).map(([tableName, count]) => (
            <p key={tableName}>
              {tableName}: {count}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="text-lg font-semibold">Configuration Supabase</h2>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="supabase-url">URL Supabase</Label>
            <Input
              id="supabase-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-supabase-url.co"
            />
          </div>
          <div>
            <Label htmlFor="supabase-api-key">Clé API Supabase</Label>
            <Input
              id="supabase-api-key"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your Supabase API Key"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Mettre à jour la configuration</Button>
        </CardFooter>
      </Card>

      <Button onClick={handleSync} disabled={isSyncing}>
        {isSyncing ? 'Synchronisation en cours...' : 'Synchroniser les données avec Supabase'}
      </Button>
    </div>
  );
};

export default AdminSyncPage;
