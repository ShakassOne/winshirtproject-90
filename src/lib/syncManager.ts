import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';
import { ExtendedLottery } from '@/types/lottery';
import { ExtendedProduct } from '@/types/product';
import { Visual, VisualCategory } from '@/types/visual';
import { validateLotteries, validateProducts, validateVisualCategories, validateVisuals, showValidationErrors } from '@/lib/syncValidator';

// Function to test connection to Supabase
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('lotteries').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error("Supabase connection test failed:", error);
    return false;
  }
};

// Function to ensure required tables exist
export const ensureLotteryTablesExist = async (): Promise<boolean> => {
  try {
    // Just check if we can access the lotteries table
    const { error } = await supabase.from('lotteries').select('id').limit(1);
    return !error;
  } catch (error) {
    console.error("Failed to validate lottery tables:", error);
    return false;
  }
};

// Function to help with debugging
const logStorageState = () => {
  try {
    const localData = localStorage.getItem('lotteries');
    const sessionData = sessionStorage.getItem('lotteries');
    console.log(`Storage debug: 
      LocalStorage: ${localData ? JSON.parse(localData).length : 'empty'} lotteries
      SessionStorage: ${sessionData ? JSON.parse(sessionData).length : 'empty'} lotteries`
    );
  } catch (e) {
    console.error("Error logging storage state:", e);
  }
};

// Function to sync lotteries to Supabase
export const syncLotteriesToSupabase = async (): Promise<boolean> => {
  try {
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.error("Synchronisation impossible - Mode hors-ligne");
      return false;
    }

    const localData = localStorage.getItem('lotteries');
    if (!localData) {
      toast.warning("Aucune loterie locale à synchroniser");
      return false;
    }

    const lotteries: ExtendedLottery[] = JSON.parse(localData);
    if (!Array.isArray(lotteries) || lotteries.length === 0) {
      toast.warning("Aucune loterie trouvée");
      return false;
    }
    
    // Valider les loteries avant la synchronisation
    const validationResult = validateLotteries(lotteries);
    if (!showValidationErrors(validationResult, 'Loterie')) {
      toast.warning("Veuillez corriger les erreurs avant de synchroniser", { position: "bottom-right" });
      return false;
    }

    // Convert camelCase to snake_case for Supabase
    const supabaseData = lotteries.map(lottery => ({
      id: lottery.id,
      title: lottery.title,
      description: lottery.description || null,
      image: lottery.image || null,
      value: lottery.value,
      status: lottery.status,
      featured: lottery.featured || false,
      target_participants: lottery.targetParticipants,
      current_participants: lottery.currentParticipants || 0,
      draw_date: lottery.drawDate || null,
      end_date: lottery.endDate || null,
      linked_products: lottery.linkedProducts || [],
    }));

    // Upsert (insert or update automatically)
    const { error } = await supabase
      .from('lotteries')
      .upsert(supabaseData, { 
        onConflict: 'id',
        ignoreDuplicates: false // Update existing records on conflict
      });

    if (error) throw error;

    toast.success(`${lotteries.length} loteries synchronisées`);
    return true;
  } catch (error) {
    console.error("Erreur de synchronisation:", error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Function to sync products to Supabase
export const syncProductsToSupabase = async (): Promise<boolean> => {
  try {
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.error("Synchronisation impossible - Mode hors-ligne");
      return false;
    }

    const localData = localStorage.getItem('products');
    if (!localData) {
      toast.warning("Aucun produit local à synchroniser");
      return false;
    }

    const products: ExtendedProduct[] = JSON.parse(localData);
    if (products.length === 0) {
      toast.warning("Aucun produit trouvé");
      return false;
    }
    
    // Valider les produits avant la synchronisation
    const validationResult = validateProducts(products);
    if (!showValidationErrors(validationResult, 'Produit')) {
      toast.warning("Veuillez corriger les erreurs avant de synchroniser", { position: "bottom-right" });
      return false;
    }

    // Convert data from camelCase to snake_case for Supabase
    const supabaseData = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description || null,
      price: product.price,
      image: product.image || null,
      secondary_image: product.secondaryImage || null,
      sizes: product.sizes || [],
      colors: product.colors || [],
      type: product.type || 'standard',
      product_type: product.productType || null,
      sleeve_type: product.sleeveType || null,
      linked_lotteries: product.linkedLotteries || [],
      popularity: product.popularity || 0,
      tickets: product.tickets || 1,
      weight: product.weight || null,
      delivery_price: product.deliveryPrice || null,
      allow_customization: product.allowCustomization,
	  default_visual_id: product.defaultVisualId || null,
      default_visual_settings: product.defaultVisualSettings || null,
      visual_category_id: product.visualCategoryId || null,
      print_areas: product.printAreas || [],
      brand: product.brand || null,
      fit: product.fit || null,
      gender: product.gender || null,
      material: product.material || null,
    }));

    // Upsert (insert or update automatically)
    const { error } = await supabase
      .from('products')
      .upsert(supabaseData, { 
        onConflict: 'id',
        ignoreDuplicates: false // Update existing records on conflict
      });

    if (error) throw error;

    toast.success(`${products.length} produits synchronisés`);
    return true;
  } catch (error) {
    console.error("Erreur de synchronisation:", error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Function to sync visual categories to Supabase
export const syncVisualCategoriesToSupabase = async (): Promise<boolean> => {
  try {
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.error("Synchronisation impossible - Mode hors-ligne");
      return false;
    }

    const localData = localStorage.getItem('visualCategories');
    if (!localData) {
      toast.warning("Aucune catégorie de visuel locale à synchroniser");
      return false;
    }

    const visualCategories: VisualCategory[] = JSON.parse(localData);
    if (!Array.isArray(visualCategories) || visualCategories.length === 0) {
      toast.warning("Aucune catégorie de visuel trouvée");
      return false;
    }
    
    // Valider les catégories de visuels avant la synchronisation
    const validationResult = validateVisualCategories(visualCategories);
    if (!showValidationErrors(validationResult, 'Catégorie de visuel')) {
      toast.warning("Veuillez corriger les erreurs avant de synchroniser", { position: "bottom-right" });
      return false;
    }

    // Convert camelCase to snake_case for Supabase
    const supabaseData = visualCategories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || null,
      slug: category.slug || null,
    }));

    // Upsert (insert or update automatically)
    const { error } = await supabase
      .from('visual_categories')
      .upsert(supabaseData, { 
        onConflict: 'id',
        ignoreDuplicates: false // Update existing records on conflict
      });

    if (error) throw error;

    toast.success(`${visualCategories.length} catégories de visuels synchronisées`);
    return true;
  } catch (error) {
    console.error("Erreur de synchronisation:", error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Function to sync visuals to Supabase
export const syncVisualsToSupabase = async (): Promise<boolean> => {
  try {
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      toast.error("Synchronisation impossible - Mode hors-ligne");
      return false;
    }

    const localData = localStorage.getItem('visuals');
    if (!localData) {
      toast.warning("Aucun visuel local à synchroniser");
      return false;
    }

    const visuals: Visual[] = JSON.parse(localData);
    if (!Array.isArray(visuals) || visuals.length === 0) {
      toast.warning("Aucun visuel trouvé");
      return false;
    }
    
    // Valider les visuels avant la synchronisation
    const validationResult = validateVisuals(visuals);
    if (!showValidationErrors(validationResult, 'Visuel')) {
      toast.warning("Veuillez corriger les erreurs avant de synchroniser", { position: "bottom-right" });
      return false;
    }

    // Convert data from camelCase to snake_case for Supabase
    const supabaseData = visuals.map(visual => ({
      id: visual.id,
      name: visual.name,
      description: visual.description || null,
      image_url: visual.image || null,
      category_id: visual.categoryId || null,
      category_name: visual.categoryName || null,
      tags: visual.tags || [],
    }));

    // Upsert (insert or update automatically)
    const { error } = await supabase
      .from('visuals')
      .upsert(supabaseData, { 
        onConflict: 'id',
        ignoreDuplicates: false // Update existing records on conflict
      });

    if (error) throw error;

    toast.success(`${visuals.length} visuels synchronisés`);
    return true;
  } catch (error) {
    console.error("Erreur de synchronisation:", error);
    toast.error(`Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    return false;
  }
};

// Function to force sync all data to Supabase
export const forceSyncAllToSupabase = async (): Promise<boolean> => {
    try {
        // First, ensure we have a connection to Supabase
        const isConnected = await testSupabaseConnection();
        if (!isConnected) {
            console.error("Cannot sync data: No connection to Supabase");
            toast.error("Impossible de synchroniser les données: Pas de connexion à Supabase", { position: "bottom-right" });
            return false;
        }

        // Sync lotteries
        const lotteriesSynced = await syncLotteriesToSupabase();
        if (!lotteriesSynced) {
            console.error("Lotteries sync failed, but continuing with other data");
            toast.error("La synchronisation des loteries a échoué, mais la synchronisation des autres données continue.", { position: "bottom-right" });
        }

        // Sync products
        const productsSynced = await syncProductsToSupabase();
        if (!productsSynced) {
            console.error("Products sync failed, but continuing with other data");
            toast.error("La synchronisation des produits a échoué, mais la synchronisation des autres données continue.", { position: "bottom-right" });
        }

        // Sync visual categories
        const visualCategoriesSynced = await syncVisualCategoriesToSupabase();
        if (!visualCategoriesSynced) {
            console.error("Visual Categories sync failed, but continuing with other data");
            toast.error("La synchronisation des catégories de visuels a échoué, mais la synchronisation des autres données continue.", { position: "bottom-right" });
        }

        // Sync visuals
        const visualsSynced = await syncVisualsToSupabase();
        if (!visualsSynced) {
            console.error("Visuals sync failed");
            toast.error("La synchronisation des visuels a échoué.", { position: "bottom-right" });
            return false; // Stop if visuals sync fails as it's the last operation
        }

        toast.success("Toutes les données ont été synchronisées avec succès", { position: "bottom-right" });
        return true;

    } catch (error) {
        console.error("Erreur lors de la synchronisation forcée de toutes les données:", error);
        toast.error(`Erreur lors de la synchronisation forcée de toutes les données: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
        return false;
    }
};

// Function to import data from JSON file
export const importDataFromJson = async (file: File): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const jsonData = JSON.parse(event.target?.result as string);

                // Validate the structure of the imported data
                if (!jsonData || typeof jsonData !== 'object') {
                    toast.error("Format de fichier invalide: Le fichier doit contenir un objet JSON principal.", { position: "bottom-right" });
                    reject(new Error("Format de fichier invalide: Le fichier doit contenir un objet JSON principal."));
                    return;
                }

                // Extract lotteries, products, visuals, and visualCategories from the JSON data
                const {
                    lotteries: importedLotteries,
                    products: importedProducts,
                    visuals: importedVisuals,
                    visualCategories: importedVisualCategories
                } = jsonData;

                // Validate and save lotteries
                if (Array.isArray(importedLotteries)) {
                    localStorage.setItem('lotteries', JSON.stringify(importedLotteries));
                    console.log(`${importedLotteries.length} loteries importées.`);
                } else {
                    console.warn("Aucune loterie à importer ou format invalide.");
                }

                // Validate and save products
                if (Array.isArray(importedProducts)) {
                    localStorage.setItem('products', JSON.stringify(importedProducts));
                    console.log(`${importedProducts.length} produits importés.`);
                } else {
                    console.warn("Aucun produit à importer ou format invalide.");
                }

                 // Validate and save visuals
                if (Array.isArray(importedVisuals)) {
                    localStorage.setItem('visuals', JSON.stringify(importedVisuals));
                    console.log(`${importedVisuals.length} visuels importés.`);
                } else {
                    console.warn("Aucun visuel à importer ou format invalide.");
                }

                // Validate and save visual categories
                if (Array.isArray(importedVisualCategories)) {
                    localStorage.setItem('visualCategories', JSON.stringify(importedVisualCategories));
                    console.log(`${importedVisualCategories.length} catégories de visuels importées.`);
                } else {
                    console.warn("Aucune catégorie de visuel à importer ou format invalide.");
                }

                toast.success("Données importées avec succès depuis le fichier JSON.", { position: "bottom-right" });
                resolve(true);

            } catch (parseError) {
                console.error("Erreur lors de l'analyse du fichier JSON:", parseError);
                toast.error("Erreur lors de l'analyse du fichier JSON. Vérifiez le format du fichier.", { position: "bottom-right" });
                reject(parseError);
            }
        };

        reader.onerror = (error) => {
            console.error("Erreur lors de la lecture du fichier:", error);
            toast.error("Erreur lors de la lecture du fichier.", { position: "bottom-right" });
            reject(error);
        };

        reader.readAsText(file);
    });
};

// Function to export data to JSON file
export const exportDataToJson = async (): Promise<void> => {
    try {
        // Retrieve data from localStorage
        const lotteries = localStorage.getItem('lotteries');
        const products = localStorage.getItem('products');
        const visuals = localStorage.getItem('visuals');
        const visualCategories = localStorage.getItem('visualCategories');

        // Create a data object containing all the data
        const data = {
            lotteries: lotteries ? JSON.parse(lotteries) : [],
            products: products ? JSON.parse(products) : [],
            visuals: visuals ? JSON.parse(visuals) : [],
            visualCategories: visualCategories ? JSON.parse(visualCategories) : []
        };

        // Convert the data object to a JSON string
        // Convert the object to string using JSON.stringify
		const stringifiedLotteryData = JSON.stringify(data);

        // Create a blob from the JSON string
        const blob = new Blob([stringifiedLotteryData], { type: 'application/json' });

        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `winshirt-data-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();

        // Clean up by removing the link
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Données exportées avec succès vers un fichier JSON.", { position: "bottom-right" });

    } catch (error) {
        console.error("Erreur lors de l'exportation des données vers un fichier JSON:", error);
        toast.error(`Erreur lors de l'exportation des données vers un fichier JSON: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    }
};

// Function to clear all local data
export const clearAllLocalData = (): void => {
    try {
        // Clear localStorage
        localStorage.clear();

        // Clear sessionStorage
        sessionStorage.clear();

        toast.success("Toutes les données locales ont été effacées avec succès.", { position: "bottom-right" });
    } catch (error) {
        console.error("Erreur lors de l'effacement des données locales:", error);
        toast.error(`Erreur lors de l'effacement des données locales: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    }
};

// Function to initialize the database schema
export const initializeDatabaseSchema = async (): Promise<void> => {
    try {
        // Check if required tables exist
        const tablesExist = await ensureLotteryTablesExist();
        if (!tablesExist) {
            console.warn("Certaines tables requises n'existent pas ou sont inaccessibles.");
            toast.warning("Certaines tables requises n'existent pas ou sont inaccessibles.", { position: "bottom-right" });
        }

        // Create the increment_lottery_participants function if it doesn't exist
        const { error: fnError } = await supabase.rpc('create_increment_function');
        if (fnError) {
            console.log("La fonction d'incrément existe déjà ou n'a pas pu être créée:", fnError);

            // If the error is due to a function already existing, it's not a problem
            if (!fnError.message.includes("already exists")) {
                console.error("Erreur lors de la création de la fonction d'incrément:", fnError);
                toast.error("Erreur lors de la création de la fonction d'incrément.", { position: "bottom-right" });
            }
        }

        // Create or update RLS policies for lotteries table
        try {
            // First disable RLS if it's enabled so we can adjust policies
            const { error: disableError } = await supabase.rpc('disable_rls_for_lotteries');
            if (disableError && !disableError.message.includes("function disable_rls_for_lotteries() does not exist")) {
                console.error("Erreur lors de la désactivation de RLS:", disableError);
                toast.error("Erreur lors de la désactivation de RLS.", { position: "bottom-right" });
            } else {
                console.log("RLS temporairement désactivé pour mettre à jour les politiques");
            }

            // Then create public access policies
            const { error: createError } = await supabase.rpc('create_lottery_public_policies');
            if (createError) {
                console.error("Erreur lors de la création des politiques d'accès public:", createError);
                toast.error("Erreur lors de la création des politiques d'accès public.", { position: "bottom-right" });
            } else {
                console.log("Politiques d'accès public créées avec succès");
            }

            // Re-enable RLS with our new policies
            const { error: enableError } = await supabase.rpc('enable_rls_for_lotteries');
            if (enableError && !enableError.message.includes("function enable_rls_for_lotteries() does not exist")) {
                console.error("Erreur lors de la réactivation de RLS:", enableError);
                toast.error("Erreur lors de la réactivation de RLS.", { position: "bottom-right" });
            } else {
                console.log("RLS réactivé avec nouvelles politiques");
            }

        } catch (rlsError) {
            console.log("Les politiques RLS existent peut-être déjà:", rlsError);
            // Non-fatal error, continue
        }

        toast.success("Schéma de base de données initialisé avec succès.", { position: "bottom-right" });

    } catch (error) {
        console.error("Erreur lors de l'initialisation du schéma de base de données:", error);
        toast.error(`Erreur lors de l'initialisation du schéma de base de données: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, { position: "bottom-right" });
    }
};
