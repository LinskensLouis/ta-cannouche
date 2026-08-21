export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      beer_availability: {
        Row: {
          beer_id: string
          id: string
          in_stock: boolean
          last_seen_at: string
          price_cents: number | null
          reported_by: string | null
          store_id: string
        }
        Insert: {
          beer_id: string
          id?: string
          in_stock?: boolean
          last_seen_at?: string
          price_cents?: number | null
          reported_by?: string | null
          store_id: string
        }
        Update: {
          beer_id?: string
          id?: string
          in_stock?: boolean
          last_seen_at?: string
          price_cents?: number | null
          reported_by?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beer_availability_beer_id_fkey"
            columns: ["beer_id"]
            isOneToOne: false
            referencedRelation: "beers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beer_availability_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beer_availability_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      beers: {
        Row: {
          abv: number | null
          barcode: string | null
          brewery_id: string | null
          created_at: string
          created_by: string | null
          format_ml: Database["public"]["Enums"]["format_ml"]
          id: string
          image_url: string | null
          name: string
          off_id: string | null
          source: Database["public"]["Enums"]["beer_source"]
          style: string | null
        }
        Insert: {
          abv?: number | null
          barcode?: string | null
          brewery_id?: string | null
          created_at?: string
          created_by?: string | null
          format_ml: Database["public"]["Enums"]["format_ml"]
          id?: string
          image_url?: string | null
          name: string
          off_id?: string | null
          source?: Database["public"]["Enums"]["beer_source"]
          style?: string | null
        }
        Update: {
          abv?: number | null
          barcode?: string | null
          brewery_id?: string | null
          created_at?: string
          created_by?: string | null
          format_ml?: Database["public"]["Enums"]["format_ml"]
          id?: string
          image_url?: string | null
          name?: string
          off_id?: string | null
          source?: Database["public"]["Enums"]["beer_source"]
          style?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "beers_brewery_id_fkey"
            columns: ["brewery_id"]
            isOneToOne: false
            referencedRelation: "breweries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      breweries: {
        Row: {
          country: string | null
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          country?: string | null
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          country?: string | null
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      checkins: {
        Row: {
          beer_id: string
          comment: string | null
          consumed_at: string
          context: Database["public"]["Enums"]["checkin_context"] | null
          created_at: string
          id: string
          photo_url: string | null
          purchase_id: string | null
          quantity_ml: number | null
          rating: number | null
          user_id: string
        }
        Insert: {
          beer_id: string
          comment?: string | null
          consumed_at?: string
          context?: Database["public"]["Enums"]["checkin_context"] | null
          created_at?: string
          id?: string
          photo_url?: string | null
          purchase_id?: string | null
          quantity_ml?: number | null
          rating?: number | null
          user_id: string
        }
        Update: {
          beer_id?: string
          comment?: string | null
          consumed_at?: string
          context?: Database["public"]["Enums"]["checkin_context"] | null
          created_at?: string
          id?: string
          photo_url?: string | null
          purchase_id?: string | null
          quantity_ml?: number | null
          rating?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_beer_id_fkey"
            columns: ["beer_id"]
            isOneToOne: false
            referencedRelation: "beers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      list_items: {
        Row: {
          beer_id: string
          list_id: string
          note: string | null
          position: number
        }
        Insert: {
          beer_id: string
          list_id: string
          note?: string | null
          position?: number
        }
        Update: {
          beer_id?: string
          list_id?: string
          note?: string | null
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "list_items_beer_id_fkey"
            columns: ["beer_id"]
            isOneToOne: false
            referencedRelation: "beers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          },
        ]
      }
      lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          expenses_visibility: Database["public"]["Enums"]["expenses_visibility"]
          id: string
          pseudo: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          expenses_visibility?: Database["public"]["Enums"]["expenses_visibility"]
          id: string
          pseudo: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          expenses_visibility?: Database["public"]["Enums"]["expenses_visibility"]
          id?: string
          pseudo?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          beer_id: string
          id: string
          pack_count: number
          pack_size: number
          purchased_at: string
          store_id: string | null
          total_price_cents: number
          user_id: string
        }
        Insert: {
          beer_id: string
          id?: string
          pack_count: number
          pack_size: number
          purchased_at?: string
          store_id?: string | null
          total_price_cents: number
          user_id: string
        }
        Update: {
          beer_id?: string
          id?: string
          pack_count?: number
          pack_size?: number
          purchased_at?: string
          store_id?: string | null
          total_price_cents?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_beer_id_fkey"
            columns: ["beer_id"]
            isOneToOne: false
            referencedRelation: "beers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          chain: string | null
          city: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          postal_code: string | null
        }
        Insert: {
          chain?: string | null
          city?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          postal_code?: string | null
        }
        Update: {
          chain?: string | null
          city?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          postal_code?: string | null
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
      beer_source: "openfoodfacts" | "manual"
      checkin_context: "home" | "out" | "party" | "festival" | "other"
      expenses_visibility: "private" | "group"
      format_ml: "250" | "330" | "440" | "500"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      beer_source: ["openfoodfacts", "manual"],
      checkin_context: ["home", "out", "party", "festival", "other"],
      expenses_visibility: ["private", "group"],
      format_ml: ["250", "330", "440", "500"],
    },
  },
} as const
