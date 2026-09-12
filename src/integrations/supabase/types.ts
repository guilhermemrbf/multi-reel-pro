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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_rate_limits: {
        Row: {
          connected_account_id: string
          created_at: string
          id: string
          published_at: string
          user_id: string
        }
        Insert: {
          connected_account_id: string
          created_at?: string
          id?: string
          published_at: string
          user_id: string
        }
        Update: {
          connected_account_id?: string
          created_at?: string
          id?: string
          published_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_rate_limits_connected_account_id_fkey"
            columns: ["connected_account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      caption_templates: {
        Row: {
          created_at: string
          id: string
          nicho: string | null
          nome: string
          texto: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nicho?: string | null
          nome: string
          texto: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nicho?: string | null
          nome?: string
          texto?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      connected_accounts: {
        Row: {
          account_status: string
          created_at: string
          facebook_page_id: string | null
          id: string
          ig_user_id: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          account_status?: string
          created_at?: string
          facebook_page_id?: string | null
          id?: string
          ig_user_id?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          account_status?: string
          created_at?: string
          facebook_page_id?: string | null
          id?: string
          ig_user_id?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      hashtag_groups: {
        Row: {
          created_at: string
          hashtags: string[]
          id: string
          nicho: string | null
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hashtags?: string[]
          id?: string
          nicho?: string | null
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hashtags?: string[]
          id?: string
          nicho?: string | null
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          created_at: string
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          original_filename: string | null
          public_url: string | null
          storage_path: string
          thumbnail_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          public_url?: string | null
          storage_path: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          original_filename?: string | null
          public_url?: string | null
          storage_path?: string
          thumbnail_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      publish_logs: {
        Row: {
          attempt_number: number
          created_at: string
          error_message: string | null
          id: string
          response_payload: Json | null
          scheduled_post_id: string
          status: string
          user_id: string
        }
        Insert: {
          attempt_number: number
          created_at?: string
          error_message?: string | null
          id?: string
          response_payload?: Json | null
          scheduled_post_id: string
          status: string
          user_id: string
        }
        Update: {
          attempt_number?: number
          created_at?: string
          error_message?: string | null
          id?: string
          response_payload?: Json | null
          scheduled_post_id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publish_logs_scheduled_post_id_fkey"
            columns: ["scheduled_post_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_posts: {
        Row: {
          attempt_count: number
          caption_override: string | null
          caption_template_id: string | null
          connected_account_id: string
          created_at: string
          error_code: string | null
          error_message: string | null
          hashtag_group_id: string | null
          hashtags_override: string[] | null
          id: string
          ig_container_id: string | null
          last_attempt_at: string | null
          media_asset_id: string
          next_attempt_at: string | null
          published_at: string | null
          scheduled_for: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attempt_count?: number
          caption_override?: string | null
          caption_template_id?: string | null
          connected_account_id: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          hashtag_group_id?: string | null
          hashtags_override?: string[] | null
          id?: string
          ig_container_id?: string | null
          last_attempt_at?: string | null
          media_asset_id: string
          next_attempt_at?: string | null
          published_at?: string | null
          scheduled_for: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attempt_count?: number
          caption_override?: string | null
          caption_template_id?: string | null
          connected_account_id?: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          hashtag_group_id?: string | null
          hashtags_override?: string[] | null
          id?: string
          ig_container_id?: string | null
          last_attempt_at?: string | null
          media_asset_id?: string
          next_attempt_at?: string | null
          published_at?: string | null
          scheduled_for?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_caption_template_id_fkey"
            columns: ["caption_template_id"]
            isOneToOne: false
            referencedRelation: "caption_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_connected_account_id_fkey"
            columns: ["connected_account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_hashtag_group_id_fkey"
            columns: ["hashtag_group_id"]
            isOneToOne: false
            referencedRelation: "hashtag_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_posts_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
