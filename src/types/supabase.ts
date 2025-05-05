
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
          address: Json
          city: string
          country: string
          created_at: string
          email: string
          id: number
          name: string
          phone: string
          postal_code: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: Json
          city?: string
          country?: string
          created_at?: string
          email?: string
          id?: number
          name?: string
          phone?: string
          postal_code?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          address?: Json
          city?: string
          country?: string
          created_at?: string
          email?: string
          id?: number
          name?: string
          phone?: string
          postal_code?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lotteries: {
        Row: {
          created_at: string
          current_participants: number
          description: string
          draw_date: string | null
          end_date: string | null
          featured: boolean
          id: number
          image: string
          linked_products: number[]
          status: string
          target_participants: number
          title: string
          value: number
        }
        Insert: {
          created_at?: string
          current_participants?: number
          description?: string
          draw_date?: string | null
          end_date?: string | null
          featured?: boolean
          id?: number
          image?: string
          linked_products?: number[]
          status?: string
          target_participants?: number
          title?: string
          value?: number
        }
        Update: {
          created_at?: string
          current_participants?: number
          description?: string
          draw_date?: string | null
          end_date?: string | null
          featured?: boolean
          id?: number
          image?: string
          linked_products?: number[]
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
          created_at: string
          email: string | null
          id: number
          lottery_id: number | null
          name: string | null
          user_id: string | null
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          id?: number
          lottery_id?: number | null
          name?: string | null
          user_id?: string | null
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string | null
          id?: number
          lottery_id?: number | null
          name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lottery_winners: {
        Row: {
          avatar: string | null
          drawn_at: string
          email: string | null
          id: number
          lottery_id: number | null
          name: string | null
          user_id: string | null
        }
        Insert: {
          avatar?: string | null
          drawn_at?: string
          email?: string | null
          id?: number
          lottery_id?: number | null
          name?: string | null
          user_id?: string | null
        }
        Update: {
          avatar?: string | null
          drawn_at?: string
          email?: string | null
          id?: number
          lottery_id?: number | null
          name?: string | null
          user_id?: string | null
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
          image_url: string
          name: string
          tags: string[]
          updated_at: string
        }
        Insert: {
          category_id?: number | null
          category_name?: string | null
          created_at?: string
          description?: string | null
          id?: number
          image_url: string
          name: string
          tags?: string[]
          updated_at?: string
        }
        Update: {
          category_id?: number | null
          category_name?: string | null
          created_at?: string
          description?: string | null
          id?: number
          image_url?: string
          name?: string
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      visual_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: number
          name: string
          description: string | null
          price: number
          image: string | null
          secondary_image: string | null
          sizes: string[]
          colors: string[]
          type: string
          product_type: string | null
          sleeve_type: string | null
          linked_lotteries: number[]
          popularity: number | null
          tickets: number
          weight: number | null
          delivery_price: number | null
          allow_customization: boolean
          default_visual_id: number | null
          default_visual_settings: Json | null
          visual_category_id: number | null
          print_areas: Json[]
          brand: string | null
          fit: string | null
          gender: string | null
          material: string | null
          created_at: string
        }
      }
    }
    Views: {}
    Functions: {
      create_increment_function: {
        Args: Record<string, never>
        Returns: void
      }
      create_lottery_public_policies: {
        Args: Record<string, never>
        Returns: void
      }
      disable_rls_for_lotteries: {
        Args: Record<string, never>
        Returns: void
      }
      enable_rls_for_lotteries: {
        Args: Record<string, never>
        Returns: void
      }
      has_role: {
        Args: {
          check_user_id: string
          check_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      increment_lottery_participants: {
        Args: {
          lottery_id_param: number
        }
        Returns: void
      }
    }
    Enums: {
      user_role: "admin" | "user" | "moderator"
    }
    CompositeTypes: {}
  }
}
