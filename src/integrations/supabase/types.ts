export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          address: Json | null
          created_at: string | null
          email: string | null
          id: number
          name: string | null
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          email?: string | null
          id?: number
          name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          email?: string | null
          id?: number
          name?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lotteries: {
        Row: {
          created_at: string | null
          current_participants: number
          description: string | null
          draw_date: string | null
          end_date: string | null
          featured: boolean | null
          id: number
          image: string | null
          linked_products: number[] | null
          status: string
          target_participants: number
          title: string
          value: number
        }
        Insert: {
          created_at?: string | null
          current_participants?: number
          description?: string | null
          draw_date?: string | null
          end_date?: string | null
          featured?: boolean | null
          id?: number
          image?: string | null
          linked_products?: number[] | null
          status?: string
          target_participants?: number
          title: string
          value: number
        }
        Update: {
          created_at?: string | null
          current_participants?: number
          description?: string | null
          draw_date?: string | null
          end_date?: string | null
          featured?: boolean | null
          id?: number
          image?: string | null
          linked_products?: number[] | null
          status?: string
          target_participants?: number
          title?: string
          value?: number
        }
        Relationships: []
      }
      lottery_participants: {
        Row: {
          avatar: string | null
          created_at: string | null
          email: string | null
          id: number
          lottery_id: number
          name: string | null
          user_id: number
        }
        Insert: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          lottery_id: number
          name?: string | null
          user_id: number
        }
        Update: {
          avatar?: string | null
          created_at?: string | null
          email?: string | null
          id?: number
          lottery_id?: number
          name?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "lottery_participants_lottery_id_fkey"
            columns: ["lottery_id"]
            isOneToOne: false
            referencedRelation: "lotteries"
            referencedColumns: ["id"]
          },
        ]
      }
      lottery_winners: {
        Row: {
          avatar: string | null
          drawn_at: string | null
          email: string | null
          id: number
          lottery_id: number
          name: string | null
          user_id: number
        }
        Insert: {
          avatar?: string | null
          drawn_at?: string | null
          email?: string | null
          id?: number
          lottery_id: number
          name?: string | null
          user_id: number
        }
        Update: {
          avatar?: string | null
          drawn_at?: string | null
          email?: string | null
          id?: number
          lottery_id?: number
          name?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "lottery_winners_lottery_id_fkey"
            columns: ["lottery_id"]
            isOneToOne: true
            referencedRelation: "lotteries"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string | null
          customization: Json | null
          id: number
          lotteries_entries: number[] | null
          order_id: number
          price: number
          product_id: number
          product_image: string | null
          product_name: string | null
          quantity: number
          size: string | null
          visual_design: Json | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          customization?: Json | null
          id?: number
          lotteries_entries?: number[] | null
          order_id: number
          price: number
          product_id: number
          product_image?: string | null
          product_name?: string | null
          quantity?: number
          size?: string | null
          visual_design?: Json | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          customization?: Json | null
          id?: number
          lotteries_entries?: number[] | null
          order_id?: number
          price?: number
          product_id?: number
          product_image?: string | null
          product_name?: string | null
          quantity?: number
          size?: string | null
          visual_design?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          client_email: string | null
          client_name: string | null
          created_at: string | null
          delivery: Json | null
          id: number
          invoice_url: string | null
          notes: string | null
          order_date: string | null
          payment: Json | null
          payment_method: string | null
          payment_status: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          shipping_method: string | null
          status: string | null
          subtotal: number | null
          total: number
          tracking_number: string | null
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          client_email?: string | null
          client_name?: string | null
          created_at?: string | null
          delivery?: Json | null
          id?: number
          invoice_url?: string | null
          notes?: string | null
          order_date?: string | null
          payment?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: string | null
          subtotal?: number | null
          total: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          client_email?: string | null
          client_name?: string | null
          created_at?: string | null
          delivery?: Json | null
          id?: number
          invoice_url?: string | null
          notes?: string | null
          order_date?: string | null
          payment?: Json | null
          payment_method?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: string | null
          subtotal?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          allow_customization: boolean | null
          brand: string | null
          colors: string[] | null
          created_at: string | null
          default_visual_id: number | null
          default_visual_settings: Json | null
          delivery_price: number | null
          description: string | null
          fit: string | null
          gender: string | null
          id: number
          image: string | null
          linked_lotteries: number[] | null
          material: string | null
          name: string
          popularity: number | null
          price: number
          print_areas: Json | null
          product_type: string | null
          secondary_image: string | null
          sizes: string[] | null
          sleeve_type: string | null
          tickets: number | null
          type: string | null
          visual_category_id: number | null
          weight: number | null
        }
        Insert: {
          allow_customization?: boolean | null
          brand?: string | null
          colors?: string[] | null
          created_at?: string | null
          default_visual_id?: number | null
          default_visual_settings?: Json | null
          delivery_price?: number | null
          description?: string | null
          fit?: string | null
          gender?: string | null
          id?: number
          image?: string | null
          linked_lotteries?: number[] | null
          material?: string | null
          name: string
          popularity?: number | null
          price: number
          print_areas?: Json | null
          product_type?: string | null
          secondary_image?: string | null
          sizes?: string[] | null
          sleeve_type?: string | null
          tickets?: number | null
          type?: string | null
          visual_category_id?: number | null
          weight?: number | null
        }
        Update: {
          allow_customization?: boolean | null
          brand?: string | null
          colors?: string[] | null
          created_at?: string | null
          default_visual_id?: number | null
          default_visual_settings?: Json | null
          delivery_price?: number | null
          description?: string | null
          fit?: string | null
          gender?: string | null
          id?: number
          image?: string | null
          linked_lotteries?: number[] | null
          material?: string | null
          name?: string
          popularity?: number | null
          price?: number
          print_areas?: Json | null
          product_type?: string | null
          secondary_image?: string | null
          sizes?: string[] | null
          sleeve_type?: string | null
          tickets?: number | null
          type?: string | null
          visual_category_id?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      visual_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      visuals: {
        Row: {
          category_id: number | null
          category_name: string | null
          created_at: string | null
          description: string | null
          id: number
          image_url: string
          name: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          category_id?: number | null
          category_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url: string
          name: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category_id?: number | null
          category_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string
          name?: string
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
      create_increment_function: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_lottery_public_policies: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_rls_helper_functions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      disable_rls_for_lotteries: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      enable_rls_for_lotteries: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      increment_lottery_participants: {
        Args: { lottery_id_param: number }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
