
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

export type ValidTableName = 'products' | 'lotteries' | 'lottery_participants' | 'lottery_winners' | 'visuals' | 'orders' | 'order_items' | 'clients';

// Vérifie la connexion à Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('lotteries').select('count').limit(1);
    
    if (error) {
      console.error("Erreur de connexion Supabase:", error);
      return false;
    }
    
    console.log("Connexion Supabase réussie");
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification de connexion:", error);
    return false;
  }
};

// Fetch data from Supabase for a specific table
export const fetchDataFromSupabase = async (tableName: ValidTableName): Promise<any[]> => {
  try {
    console.log(`Récupération des données depuis Supabase pour ${tableName}...`);
    
    const { data, error } = await supabase
      .from(tableName)
      .select('*');
    
    if (error) {
      console.error(`Erreur lors de la récupération des données de ${tableName}:`, error);
      throw error;
    }
    
    if (data) {
      const camelCaseData = data.map(item => snakeToCamel(item));
      localStorage.setItem(tableName, JSON.stringify(camelCaseData));
      console.log(`Données de ${tableName} mises à jour: ${camelCaseData.length} éléments`);
      return camelCaseData;
    }
    
    return [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des données de ${tableName}:`, error);
    
    // Récupérer depuis localStorage en cas d'erreur
    const localData = localStorage.getItem(tableName);
    if (localData) {
      try {
        const parsedData = JSON.parse(localData);
        console.log(`Données récupérées depuis localStorage pour ${tableName}: ${parsedData.length} éléments`);
        return parsedData;
      } catch (parseError) {
        console.error(`Erreur lors de l'analyse des données locales:`, parseError);
      }
    }
    
    return [];
  }
};

// Synchronize local data to Supabase
export const syncLocalDataToSupabase = async (tableName: ValidTableName): Promise<boolean> => {
  try {
    console.log(`Synchronisation des données locales vers Supabase pour ${tableName}...`);
    
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.log("Pas de connexion à Supabase, impossible de synchroniser");
      return false;
    }
    
    // Récupérer les données locales
    const localData = localStorage.getItem(tableName);
    if (!localData) {
      console.log(`Aucune donnée locale à synchroniser pour ${tableName}`);
      return false;
    }
    
    const parsedData = JSON.parse(localData);
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      console.log(`Données locales invalides pour ${tableName}`);
      return false;
    }
    
    // Convertir en snake_case pour Supabase
    const snakeCaseData = parsedData.map(item => camelToSnake(item));
    
    // Supprimer toutes les données existantes
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .gte('id', 0);  // Supprime toutes les lignes avec un ID >= 0
    
    if (deleteError) {
      console.error(`Erreur lors de la suppression des données de ${tableName}:`, deleteError);
      return false;
    }
    
    // Insérer les nouvelles données
    const { error: insertError } = await supabase
      .from(tableName)
      .insert(snakeCaseData);
    
    if (insertError) {
      console.error(`Erreur lors de l'insertion des données dans ${tableName}:`, insertError);
      return false;
    }
    
    console.log(`Données de ${tableName} synchronisées avec succès`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la synchronisation des données de ${tableName}:`, error);
    return false;
  }
};

// Ajouter la colonne manquante 'category_name' à la table 'visuals' dans Supabase
export const addCategoryNameColumn = async (): Promise<boolean> => {
  try {
    console.log("Vérification et ajout de la colonne category_name à la table visuals...");
    
    // Vérifier d'abord si la connexion à Supabase est établie
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.log("Pas de connexion à Supabase");
      return false;
    }

    // Vérifier si la colonne existe déjà
    const { data: columns, error: columnError } = await supabase
      .rpc('get_column_info', { 
        p_table_name: 'visuals',
        p_column_name: 'category_name'
      });
    
    if (columnError) {
      console.error("Erreur lors de la vérification de la colonne:", columnError);
      return false;
    }
    
    // Si la colonne existe déjà, ne rien faire
    if (columns && columns.length > 0) {
      console.log("La colonne 'category_name' existe déjà dans la table 'visuals'");
      return true;
    }
    
    // Ajouter la colonne si elle n'existe pas
    const { error: alterError } = await supabase.rpc('add_column_if_not_exists', {
      p_table_name: 'visuals',
      p_column_name: 'category_name',
      p_column_type: 'text'
    });
    
    if (alterError) {
      console.error("Erreur lors de l'ajout de la colonne:", alterError);
      return false;
    }

    console.log("Colonne 'category_name' ajoutée avec succès à la table 'visuals'");
    
    // Mettre à jour les données existantes pour ajouter le category_name
    const { data: visuals, error: visualsError } = await supabase
      .from('visuals')
      .select('id, category_id');
    
    if (visualsError) {
      console.error("Erreur lors de la récupération des visuels:", visualsError);
      return false;
    }
    
    // Récupérer les catégories pour obtenir les noms
    const { data: categories, error: categoriesError } = await supabase
      .from('visual_categories')
      .select('id, name');
    
    if (categoriesError) {
      console.error("Erreur lors de la récupération des catégories:", categoriesError);
      return false;
    }
    
    // Mettre à jour chaque visuel avec le nom de sa catégorie
    if (visuals && categories) {
      for (const visual of visuals) {
        const category = categories.find(c => c.id === visual.category_id);
        if (category) {
          await supabase
            .from('visuals')
            .update({ category_name: category.name })
            .eq('id', visual.id);
        }
      }
      console.log("Données de category_name mises à jour avec succès");
    }
    
    return true;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la colonne category_name:", error);
    return false;
  }
};

// Function to create tables or fix schema issues if needed
export const ensureDatabaseSchema = async (): Promise<boolean> => {
  try {
    console.log("Vérification et mise à jour du schéma de la base de données...");
    
    const isConnected = await checkSupabaseConnection();
    if (!isConnected) {
      console.log("Pas de connexion à Supabase");
      return false;
    }

    // Create functions to help with schema management
    await supabase.rpc('create_schema_helper_functions');
    
    // Add category_name column to visuals table if it doesn't exist
    await addCategoryNameColumn();
    
    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du schéma:", error);
    return false;
  }
};

// Fonction utilitaire pour convertir de snake_case à camelCase
export const snakeToCamel = (obj: any): any => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item));
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    acc[camelKey] = snakeToCamel(obj[key]);
    return acc;
  }, {} as any);
};

// Fonction utilitaire pour convertir de camelCase à snake_case
export const camelToSnake = (obj: any): any => {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item));
  }
  
  return Object.keys(obj).reduce((acc, key) => {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {} as any);
};
