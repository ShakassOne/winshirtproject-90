import { supabase, checkSupabaseConnection, checkRequiredTables, requiredTables, ValidTableName } from '@/integrations/supabase/client';
import { toast } from '@/lib/toast';

// SQL statements to create the required tables if they don't exist
export const createTablesSQL = {
  lotteries: `
    CREATE TABLE IF NOT EXISTS lotteries (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      value NUMERIC NOT NULL,
      target_participants INTEGER NOT NULL DEFAULT 10,
      current_participants INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      image TEXT,
      linked_products INTEGER[] DEFAULT '{}',
      end_date TIMESTAMP WITH TIME ZONE,
      draw_date TIMESTAMP WITH TIME ZONE,
      featured BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  lottery_participants: `
    CREATE TABLE IF NOT EXISTS lottery_participants (
      id SERIAL PRIMARY KEY,
      lottery_id INTEGER NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL,
      name TEXT,
      email TEXT,
      avatar TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(lottery_id, user_id)
    );
  `,
  
  lottery_winners: `
    CREATE TABLE IF NOT EXISTS lottery_winners (
      id SERIAL PRIMARY KEY,
      lottery_id INTEGER NOT NULL REFERENCES lotteries(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL,
      name TEXT,
      email TEXT,
      avatar TEXT,
      drawn_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(lottery_id)
    );
  `,
  
  products: `
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC NOT NULL,
      image TEXT,
      secondary_image TEXT,
      sizes TEXT[] DEFAULT '{}',
      colors TEXT[] DEFAULT '{}',
      type TEXT DEFAULT 'standard',
      product_type TEXT,
      sleeve_type TEXT,
      linked_lotteries INTEGER[] DEFAULT '{}',
      popularity NUMERIC DEFAULT 0,
      tickets INTEGER DEFAULT 1,
      weight NUMERIC,
      delivery_price NUMERIC,
      allow_customization BOOLEAN DEFAULT false,
      default_visual_id INTEGER,
      default_visual_settings JSONB,
      visual_category_id INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  visuals: `
    CREATE TABLE IF NOT EXISTS visuals (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      category_id INTEGER,
      tags TEXT[] DEFAULT '{}',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  orders: `
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      status TEXT DEFAULT 'pending',
      total NUMERIC NOT NULL,
      shipping_address JSONB,
      shipping_method TEXT,
      shipping_cost NUMERIC DEFAULT 0,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  order_items: `
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      price NUMERIC NOT NULL,
      customization JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  
  clients: `
    CREATE TABLE IF NOT EXISTS clients (
      id SERIAL PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id),
      name TEXT,
      email TEXT UNIQUE,
      phone TEXT,
      address JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
} as const;

// Re-export the ValidTableName type for use in other files
export { ValidTableName };

// Function to create missing tables
const createMissingTables = async (missingTables: readonly string[]): Promise<boolean> => {
  let success = true;
  
  for (const tableName of missingTables) {
    const sqlTable = tableName as keyof typeof createTablesSQL;
    if (createTablesSQL[sqlTable]) {
      const sql = createTablesSQL[sqlTable];
      console.log(`Creating table ${tableName}...`);
      
      try {
        // TypeScript fix: cast SQL query string to any to bypass strict typing
        const { error } = await supabase.rpc('exec_sql', { sql_query: sql as any });
        
        if (error) {
          console.error(`Error creating table ${tableName}:`, error);
          success = false;
          
          // Fallback: try direct SQL execution if RPC fails
          try {
            // Using raw query instead of non-existent sql method
            const { error: directError } = await supabase
              .from('pg_tables')  // Using a query on an existing table as fallback
              .select('*')
              .limit(0);  // Just to check connection
              
            if (!directError) {
              // Attempt to create table by making an API request to a custom edge function
              console.log(`Attempting alternate method to create table ${tableName}`);
              
              // Note: In a real implementation, you would need to have a Supabase Edge Function
              // that can execute SQL. For now we'll just log that this would be needed.
              console.log(`Table ${tableName} would need to be created manually or via Edge Function`);
            } else {
              console.error(`Failed to connect to database:`, directError);
            }
          } catch (directError) {
            console.error(`Exception when accessing database:`, directError);
          }
        } else {
          console.log(`Table ${tableName} created successfully`);
        }
      } catch (error) {
        console.error(`Exception when creating table ${tableName}:`, error);
        success = false;
      }
    }
  }
  
  return success;
};

// New function to manually force connection to Supabase
export const forceSupabaseConnection = async (): Promise<boolean> => {
  console.log("Forcing Supabase connection...");
  
  try {
    // Test connection with a simple query
    const { data, error } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public')
      .limit(1);
    
    if (error) {
      console.error("Error forcing Supabase connection:", error);
      toast.error("Impossible de connecter à Supabase: " + error.message);
      return false;
    }
    
    console.log("Successfully forced connection to Supabase");
    toast.success("Connexion à Supabase établie avec succès!");
    
    // Check required tables
    const tablesResult = await checkRequiredTables();
    if (!tablesResult.exists) {
      console.log(`Missing tables: ${tablesResult.missing.join(', ')}`);
      
      const confirm = window.confirm(
        `Les tables suivantes sont manquantes: ${tablesResult.missing.join(', ')}. Souhaitez-vous les créer automatiquement?`
      );
      
      if (confirm) {
        const created = await createMissingTables(tablesResult.missing);
        if (created) {
          toast.success("Tables créées avec succès");
        } else {
          toast.error("Certaines tables n'ont pas pu être créées");
        }
      }
    }
    
    // Setup realtime subscriptions
    setupRealtimeSubscriptions();
    
    return true;
  } catch (error) {
    console.error("Exception forcing Supabase connection:", error);
    toast.error("Erreur de connexion à Supabase");
    return false;
  }
};

// Function to initialize Supabase connection
export const initializeSupabase = async () => {
  console.log("Initializing Supabase connection...");
  
  try {
    // Check connection to Supabase
    const isConnected = await checkSupabaseConnection();
    
    if (isConnected) {
      console.log("Successfully connected to Supabase");
      
      // Check if all required tables exist
      const { exists, missing } = await checkRequiredTables();
      
      if (!exists && missing.length > 0) {
        console.log(`Missing tables: ${missing.join(', ')}`);
        
        // Create missing tables
        const tablesCreated = await createMissingTables(missing);
        
        if (tablesCreated) {
          console.log("All missing tables created successfully");
          toast.success("Base de données initialisée avec succès");
        } else {
          console.warn("Some tables could not be created");
          toast.error("Certaines tables n'ont pas pu être créées, contactez l'administrateur");
        }
      } else {
        console.log("All required tables exist");
      }
      
      // Subscribe to realtime channels for critical tables
      setupRealtimeSubscriptions();
      
      return true;
    } else {
      console.warn("Unable to connect to Supabase, using fallback data");
      toast.error("Impossible de se connecter au serveur, mode hors-ligne activé");
      return false;
    }
  } catch (error) {
    console.error("Error initializing Supabase:", error);
    toast.error("Erreur de connexion au serveur");
    return false;
  }
};

// Setup realtime subscriptions
const setupRealtimeSubscriptions = () => {
  // Subscribe to lotteries changes
  const lotteriesChannel = supabase
    .channel('lottery-updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'lotteries' }, 
      (payload) => {
        console.log("Lottery data changed:", payload);
        // The component will handle the actual data refresh
      }
    )
    .subscribe();
  
  // Subscribe to lottery participants changes  
  const participantsChannel = supabase
    .channel('participant-updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'lottery_participants' }, 
      (payload) => {
        console.log("Lottery participant data changed:", payload);
        // The component will handle the actual data refresh
      }
    )
    .subscribe();
  
  // Subscribe to lottery winners changes
  const winnersChannel = supabase
    .channel('winner-updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'lottery_winners' }, 
      (payload) => {
        console.log("Lottery winner data changed:", payload);
        // The component will handle the actual data refresh
      }
    )
    .subscribe();
    
  // Subscribe to products changes
  const productsChannel = supabase
    .channel('product-updates')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'products' }, 
      (payload) => {
        console.log("Product data changed:", payload);
        // The component will handle the actual data refresh
      }
    )
    .subscribe();

  // We don't need to unsubscribe because these channels should last for the entire app lifetime
};

// Sync config definition
export const syncConfig = {
  autoSync: true,
  tables: ['lotteries', 'products', 'lottery_participants', 'lottery_winners', 'orders', 'order_items', 'clients', 'visuals'] as const
};

// Function to sync data from localStorage to Supabase
export const syncData = async (tableName: ValidTableName): Promise<boolean> => {
  try {
    console.log(`Syncing ${tableName} data to Supabase...`);
    
    // Get data from localStorage
    const localData = localStorage.getItem(tableName);
    if (!localData) {
      console.log(`No local data found for ${tableName}`);
      return false;
    }
    
    const parsedData = JSON.parse(localData);
    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      console.log(`No valid data found for ${tableName} in localStorage`);
      return false;
    }
    
    // Map keys to database format based on table name
    const preparedData = parsedData.map(item => {
      // Common fields that keep the same name
      const result: any = { ...item };
      
      // Table-specific transformations
      if (tableName === 'lotteries') {
        if ('targetParticipants' in item) result.target_participants = item.targetParticipants;
        if ('currentParticipants' in item) result.current_participants = item.currentParticipants;
        if ('linkedProducts' in item) result.linked_products = item.linkedProducts;
        if ('endDate' in item) result.end_date = item.endDate;
        if ('drawDate' in item) result.draw_date = item.drawDate;
        
        // Remove fields that don't belong in the database
        delete result.targetParticipants;
        delete result.currentParticipants;
        delete result.linkedProducts;
        delete result.endDate;
        delete result.drawDate;
        delete result.participants;
        delete result.winner;
      } 
      else if (tableName === 'products') {
        if ('secondaryImage' in item) result.secondary_image = item.secondaryImage;
        if ('productType' in item) result.product_type = item.productType;
        if ('sleeveType' in item) result.sleeve_type = item.sleeveType;
        if ('linkedLotteries' in item) result.linked_lotteries = item.linkedLotteries;
        if ('deliveryPrice' in item) result.delivery_price = item.deliveryPrice;
        if ('allowCustomization' in item) result.allow_customization = item.allowCustomization;
        if ('defaultVisualId' in item) result.default_visual_id = item.defaultVisualId;
        if ('defaultVisualSettings' in item) result.default_visual_settings = item.defaultVisualSettings;
        if ('visualCategoryId' in item) result.visual_category_id = item.visualCategoryId;
        
        // Remove fields that don't belong in the database
        delete result.secondaryImage;
        delete result.productType;
        delete result.sleeveType;
        delete result.linkedLotteries;
        delete result.deliveryPrice;
        delete result.allowCustomization;
        delete result.defaultVisualId;
        delete result.defaultVisualSettings;
        delete result.visualCategoryId;
      }
      
      return result;
    });
    
    // Clear the table first
    const { error: deleteError } = await supabase
      .from(tableName)
      .delete()
      .neq('id', 0); // Delete all rows
    
    if (deleteError) {
      console.error(`Error clearing ${tableName} table:`, deleteError);
      return false;
    }
    
    // Insert data in batches of 50 to avoid payload limits
    const batchSize = 50;
    for (let i = 0; i < preparedData.length; i += batchSize) {
      const batch = preparedData.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(batch);
      
      if (insertError) {
        console.error(`Error inserting batch to ${tableName}:`, insertError);
        return false;
      }
    }
    
    console.log(`Successfully synced ${preparedData.length} records to ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Error syncing ${tableName}:`, error);
    return false;
  }
};
