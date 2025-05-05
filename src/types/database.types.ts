// Supabase types from database schema
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          postal_code: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lotteries: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: number
          image: string | null
          is_active: boolean | null
          max_participants: number | null
          start_date: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: number
          image?: string | null
          is_active?: boolean | null
          max_participants?: number | null
          start_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: number
          image?: string | null
          is_active?: boolean | null
          max_participants?: number | null
          start_date?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: []
      }
      lottery_participants: {
        Row: {
          created_at: string
          id: number
          lottery_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          lottery_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          lottery_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lottery_participants_lottery_id_fkey"
            columns: ["lottery_id"]
            referencedRelation: "lotteries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_participants_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      lottery_winners: {
        Row: {
          created_at: string
          id: number
          lottery_id: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          lottery_id?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          lottery_id?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lottery_winners_lottery_id_fkey"
            columns: ["lottery_id"]
            referencedRelation: "lotteries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lottery_winners_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: number
          order_id: number | null
          price: number | null
          product_id: number | null
          quantity: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          order_id?: number | null
          price?: number | null
          product_id?: number | null
          quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          order_id?: number | null
          price?: number | null
          product_id?: number | null
          quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      orders: {
        Row: {
          amount_total: number | null
          created_at: string
          id: number
          order_number: string | null
          payment_status: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_total?: number | null
          created_at?: string
          id?: number
          order_number?: string | null
          payment_status?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_total?: number | null
          created_at?: string
          id?: number
          order_number?: string | null
          payment_status?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          allow_customization: boolean | null
          brand: string | null
          created_at: string
          default_visual_id: number | null
          default_visual_settings: Json | null
          delivery_price: number | null
          description: string | null
          fit: string | null
          gender: string | null
          id: number
          image: string | null
          material: string | null
          name: string | null
          popularity: number | null
          price: number | null
          print_areas: Json | null
          product_type: string | null
          secondary_image: string | null
          sleeve_type: string | null
          sizes: string[] | null
          tickets: number | null
          type: string | null
          visual_category_id: number | null
          weight: number | null
          colors: string[] | null
        }
        Insert: {
          allow_customization?: boolean | null
          brand?: string | null
          created_at?: string
          default_visual_id?: number | null
          default_visual_settings?: Json | null
          delivery_price?: number | null
          description?: string | null
          fit?: string | null
          gender?: string | null
          id?: number
          image?: string | null
          material?: string | null
          name?: string | null
          popularity?: number | null
          price?: number | null
          print_areas?: Json | null
          product_type?: string | null
          secondary_image?: string | null
          sleeve_type?: string | null
          sizes?: string[] | null
          tickets?: number | null
          type?: string | null
          visual_category_id?: number | null
          weight?: number | null
          colors?: string[] | null
        }
        Update: {
          allow_customization?: boolean | null
          brand?: string | null
          created_at?: string
          default_visual_id?: number | null
          default_visual_settings?: Json | null
          delivery_price?: number | null
          description?: string | null
          fit?: string | null
          gender?: string | null
          id?: number
          image?: string | null
          material?: string | null
          name?: string | null
          popularity?: number | null
          price?: number | null
          print_areas?: Json | null
          product_type?: string | null
          secondary_image?: string | null
          sleeve_type?: string | null
          sizes?: string[] | null
          tickets?: number | null
          type?: string | null
          visual_category_id?: number | null
          weight?: number | null
          colors?: string[] | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: number
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      visual_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      visuals: {
        Row: {
          category_id: number | null
          category_name: string | null
          created_at: string
          description: string | null
          id: number
          image: string | null
          image_url: string | null
          name: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category_id?: number | null
          category_name?: string | null
          created_at?: string
          description?: string | null
          id?: number
          image?: string | null
          image_url?: string | null
          name?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category_id?: number | null
          category_name?: string | null
          created_at?: string
          description?: string | null
          id?: number
          image?: string | null
          image_url?: string | null
          name?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & { step: { Row: { current: number; total: number; }; Insert: never; Update: never; Relationships: never; }; })
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName]
  : Database["public"]["Tables"][PublicTableNameOrOptions]

export type Table<
  TableName extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][TableName]

// Add the DatabaseTables type for use in other parts of the application
export type DatabaseTables = {
  clients: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    created_at?: string;
    updated_at?: string;
    user_id?: string;
  };
  orders: {
    id: number;
    user_id?: string;
    status?: string;
    payment_status?: string;
    amount_total?: number;
    created_at?: string;
    updated_at?: string;
    order_number?: string;
  };
  // Add other table types as needed
};

// Add the Product type
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  secondary_image?: string;
  sizes?: string[];
  colors?: string[];
  type?: string;
  product_type?: string;
  sleeve_type?: string;
  linked_lotteries?: number[];
  popularity?: number;
  tickets?: number;
  weight?: number;
  delivery_price?: number;
  allow_customization?: boolean;
  default_visual_id?: number | null;
  default_visual_settings?: any | null;
  visual_category_id?: number | null;
  print_areas?: any[];
  created_at?: string;
  brand?: string;
  fit?: string;
  gender?: string;
  material?: string;
}
