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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bookmarks: {
        Row: {
          created_at: string
          favicon: string | null
          folder_name: string | null
          id: string
          position: number | null
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          favicon?: string | null
          folder_name?: string | null
          id?: string
          position?: number | null
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          favicon?: string | null
          folder_name?: string | null
          id?: string
          position?: number | null
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      browsing_history: {
        Row: {
          created_at: string
          favicon: string | null
          id: string
          last_visited: string
          title: string
          url: string
          user_id: string
          visit_count: number | null
        }
        Insert: {
          created_at?: string
          favicon?: string | null
          id?: string
          last_visited?: string
          title: string
          url: string
          user_id: string
          visit_count?: number | null
        }
        Update: {
          created_at?: string
          favicon?: string | null
          id?: string
          last_visited?: string
          title?: string
          url?: string
          user_id?: string
          visit_count?: number | null
        }
        Relationships: []
      }
      direct_conversations: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user1_username: string
          user2_username: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user1_username: string
          user2_username: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user1_username?: string
          user2_username?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          image_url: string | null
          is_read: boolean | null
          message_type: string | null
          sender_username: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          message_type?: string | null
          sender_username: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          is_read?: boolean | null
          message_type?: string | null
          sender_username?: string
        }
        Relationships: [
          {
            foreignKeyName: "direct_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "direct_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      downloads: {
        Row: {
          completed_at: string | null
          created_at: string
          filename: string
          id: string
          mime_type: string | null
          progress: number | null
          size_bytes: number | null
          status: string | null
          url: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          filename: string
          id?: string
          mime_type?: string | null
          progress?: number | null
          size_bytes?: number | null
          status?: string | null
          url: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          filename?: string
          id?: string
          mime_type?: string | null
          progress?: number | null
          size_bytes?: number | null
          status?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      email_folders: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          position: number | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          position?: number | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          position?: number | null
          user_id?: string
        }
        Relationships: []
      }
      email_group_members: {
        Row: {
          email: string
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          email: string
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          email?: string
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "email_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      email_groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          domain: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          domain: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          domain?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      emails: {
        Row: {
          body: string
          created_at: string
          folder: string | null
          from_email: string
          from_user_id: string
          id: string
          is_read: boolean | null
          is_starred: boolean | null
          subject: string
          to_email: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          folder?: string | null
          from_email: string
          from_user_id: string
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          subject: string
          to_email: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          folder?: string | null
          from_email?: string
          from_user_id?: string
          id?: string
          is_read?: boolean | null
          is_starred?: boolean | null
          subject?: string
          to_email?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          is_active: boolean | null
          joined_at: string
          user_id: string
          username: string
        }
        Insert: {
          group_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          user_id: string
          username: string
        }
        Update: {
          group_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          avatar_url: string | null
          content: string
          created_at: string
          group_id: string
          id: string
          image_url: string | null
          message_type: string | null
          sticker_name: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          content: string
          created_at?: string
          group_id: string
          id?: string
          image_url?: string | null
          message_type?: string | null
          sticker_name?: string | null
          username?: string
        }
        Update: {
          avatar_url?: string | null
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          image_url?: string | null
          message_type?: string | null
          sticker_name?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          id: string
          is_public: boolean
          name: string
          owner_id: string | null
          password_hash: string | null
          tags: string[] | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean
          name: string
          owner_id?: string | null
          password_hash?: string | null
          tags?: string[] | null
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean
          name?: string
          owner_id?: string | null
          password_hash?: string | null
          tags?: string[] | null
        }
        Relationships: []
      }
      media_uploads: {
        Row: {
          created_at: string
          file_size: number | null
          file_type: string
          filename: string
          id: string
          mime_type: string | null
          original_url: string | null
          storage_path: string
          updated_at: string
          upload_source: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          file_type: string
          filename: string
          id?: string
          mime_type?: string | null
          original_url?: string | null
          storage_path: string
          updated_at?: string
          upload_source: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_size?: number | null
          file_type?: string
          filename?: string
          id?: string
          mime_type?: string | null
          original_url?: string | null
          storage_path?: string
          updated_at?: string
          upload_source?: string
          user_id?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          avatar_url: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          message_type: string | null
          sticker_name: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          message_type?: string | null
          sticker_name?: string | null
          username?: string
        }
        Update: {
          avatar_url?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          message_type?: string | null
          sticker_name?: string | null
          username?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          email_domain: string | null
          email_username: string | null
          id: string
          is_active: boolean | null
          profile_type: Database["public"]["Enums"]["profile_type"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email_domain?: string | null
          email_username?: string | null
          id?: string
          is_active?: boolean | null
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          email_domain?: string | null
          email_username?: string | null
          id?: string
          is_active?: boolean | null
          profile_type?: Database["public"]["Enums"]["profile_type"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_list: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_read: boolean | null
          read_time: string | null
          site_name: string | null
          title: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          read_time?: string | null
          site_name?: string | null
          title: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          read_time?: string | null
          site_name?: string | null
          title?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      tab_groups: {
        Row: {
          color: string
          created_at: string
          id: string
          is_collapsed: boolean | null
          name: string
          tabs: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          is_collapsed?: boolean | null
          name: string
          tabs?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_collapsed?: boolean | null
          name?: string
          tabs?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          block_fingerprinting: boolean | null
          block_third_party_cookies: boolean | null
          block_trackers: boolean | null
          created_at: string
          id: string
          search_engine: string | null
          send_do_not_track: boolean | null
          startup_behavior: string | null
          startup_urls: string[] | null
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          block_fingerprinting?: boolean | null
          block_third_party_cookies?: boolean | null
          block_trackers?: boolean | null
          created_at?: string
          id?: string
          search_engine?: string | null
          send_do_not_track?: boolean | null
          startup_behavior?: string | null
          startup_urls?: string[] | null
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          block_fingerprinting?: boolean | null
          block_third_party_cookies?: boolean | null
          block_trackers?: boolean | null
          created_at?: string
          id?: string
          search_engine?: string | null
          send_do_not_track?: boolean | null
          startup_behavior?: string | null
          startup_urls?: string[] | null
          theme?: string | null
          updated_at?: string
          user_id?: string
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
      profile_type: "personal" | "work" | "development" | "custom"
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
  public: {
    Enums: {
      profile_type: ["personal", "work", "development", "custom"],
    },
  },
} as const
