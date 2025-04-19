
// Custom database types to use with Supabase client
// This complements the auto-generated types from src/integrations/supabase/types.ts

// Define the structure for various database tables
export interface DatabaseTables {
  lotteries: {
    id: number;
    title: string;
    description: string | null;
    value: number;
    target_participants: number;
    current_participants: number;
    status: "active" | "completed" | "relaunched" | "cancelled";
    image: string | null;
    linked_products: number[] | null;
    end_date: string | null;
    draw_date: string | null;
    featured: boolean | null;
    created_at: string | null;
  };
  
  lottery_participants: {
    id: number;
    lottery_id: number;
    user_id: number;
    name: string | null;
    email: string | null;
    avatar: string | null;
    created_at: string | null;
  };
  
  lottery_winners: {
    id: number;
    lottery_id: number;
    user_id: number;
    name: string | null;
    email: string | null;
    avatar: string | null;
    drawn_at: string | null;
  };
  
  products: {
    id: number;
    name: string;
    description: string | null;
    price: number;
    image: string | null;
    secondary_image: string | null;
    sizes: string[] | null;
    colors: string[] | null;
    type: string | null;
    product_type: string | null;
    sleeve_type: string | null;
    linked_lotteries: number[] | null;
    popularity: number | null;
    tickets: number | null;
    weight: number | null;
    delivery_price: number | null;
    allow_customization: boolean | null;
    default_visual_id: number | null;
    default_visual_settings: any | null;
    visual_category_id: number | null;
    created_at: string | null;
  };
  
  visuals: {
    id: number;
    name: string;
    description: string | null;
    image_url: string;
    category_id: number | null;
    tags: string[] | null;
    created_at: string | null;
  };
  
  orders: {
    id: number;
    user_id: number | null;
    status: string | null;
    total: number;
    shipping_address: any | null;
    shipping_method: string | null;
    shipping_cost: number | null;
    payment_method: string | null;
    payment_status: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  
  order_items: {
    id: number;
    order_id: number;
    product_id: number;
    quantity: number;
    price: number;
    customization: any | null;
    created_at: string | null;
  };
  
  clients: {
    id: number;
    user_id: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    address: any | null;
    created_at: string | null;
    updated_at: string | null;
    orderCount?: number; // Optional for extended client information
    totalSpent?: number; // Optional for extended client information
    participatedLotteries?: number[]; // Optional extended info
    wonLotteries?: number[]; // Optional extended info
  };
  
  pg_tables: {
    schemaname: string | null;
    tablename: string | null;
    tableowner: string | null;
    tablespace: string | null;
    hasindexes: boolean | null;
    hasrules: boolean | null;
    hastriggers: boolean | null;
    rowsecurity: boolean | null;
  };
}

// Add any helper types or interfaces below if needed
