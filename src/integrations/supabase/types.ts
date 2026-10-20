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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          assignee_id: string | null
          case_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string
          id: string
          kind: string
          location: string | null
          organization_id: string
          reminder_minutes: number | null
          starts_at: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at: string
          id?: string
          kind?: string
          location?: string | null
          organization_id: string
          reminder_minutes?: number | null
          starts_at: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string
          id?: string
          kind?: string
          location?: string | null
          organization_id?: string
          reminder_minutes?: number | null
          starts_at?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_assignee_id_organization_id_fkey"
            columns: ["assignee_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["user_id", "organization_id"]
          },
          {
            foreignKeyName: "appointments_case_id_organization_id_fkey"
            columns: ["case_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "appointments_client_id_organization_id_fkey"
            columns: ["client_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          organization_id: string
          summary: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          organization_id: string
          summary?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          organization_id?: string
          summary?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_events: {
        Row: {
          case_id: string
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          id: string
          organization_id: string
          title: string
        }
        Insert: {
          case_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          id?: string
          organization_id: string
          title: string
        }
        Update: {
          case_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          id?: string
          organization_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_events_case_id_organization_id_fkey"
            columns: ["case_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "case_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          area: string | null
          client_id: string | null
          court: string | null
          created_at: string
          created_by: string | null
          description: string | null
          district: string | null
          id: string
          number: string
          number_is_cnj: boolean
          opposing_party: string | null
          organization_id: string
          responsible_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          area?: string | null
          client_id?: string | null
          court?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          district?: string | null
          id?: string
          number: string
          number_is_cnj?: boolean
          opposing_party?: string | null
          organization_id: string
          responsible_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          area?: string | null
          client_id?: string | null
          court?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          district?: string | null
          id?: string
          number?: string
          number_is_cnj?: boolean
          opposing_party?: string | null
          organization_id?: string
          responsible_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_client_id_organization_id_fkey"
            columns: ["client_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "cases_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_responsible_id_organization_id_fkey"
            columns: ["responsible_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["user_id", "organization_id"]
          },
        ]
      }
      clients: {
        Row: {
          cep: string | null
          city: string | null
          complement: string | null
          created_at: string
          created_by: string | null
          document: string | null
          email: string | null
          id: string
          kind: string
          marital_status: string | null
          name: string
          nationality: string | null
          neighborhood: string | null
          notes: string | null
          number: string | null
          organization_id: string
          phone: string | null
          profession: string | null
          rg: string | null
          state: string | null
          street: string | null
          updated_at: string
        }
        Insert: {
          cep?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          created_by?: string | null
          document?: string | null
          email?: string | null
          id?: string
          kind?: string
          marital_status?: string | null
          name: string
          nationality?: string | null
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          organization_id: string
          phone?: string | null
          profession?: string | null
          rg?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
        }
        Update: {
          cep?: string | null
          city?: string | null
          complement?: string | null
          created_at?: string
          created_by?: string | null
          document?: string | null
          email?: string | null
          id?: string
          kind?: string
          marital_status?: string | null
          name?: string
          nationality?: string | null
          neighborhood?: string | null
          notes?: string | null
          number?: string | null
          organization_id?: string
          phone?: string | null
          profession?: string | null
          rg?: string | null
          state?: string | null
          street?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          dedupe_key: string | null
          id: string
          link: string | null
          organization_id: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          dedupe_key?: string | null
          id?: string
          link?: string | null
          organization_id: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          dedupe_key?: string | null
          id?: string
          link?: string | null
          organization_id?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          created_at: string
          created_by: string
          email: string | null
          id: string
          name: string
          oab: string | null
          oab_uf: string | null
          phone: string | null
          plan: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          name: string
          oab?: string | null
          oab_uf?: string | null
          phone?: string | null
          plan?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          name?: string
          oab?: string | null
          oab_uf?: string | null
          phone?: string | null
          plan?: string
          updated_at?: string
        }
        Relationships: []
      }
      petitions: {
        Row: {
          case_id: string | null
          client_id: string | null
          created_at: string
          created_by: string | null
          filed_at: string | null
          id: string
          kind: string | null
          notes: string | null
          official_deadline: string | null
          organization_id: string
          priority: string
          protocol_number: string | null
          receipt_path: string | null
          responsible_id: string | null
          status: string
          summary: string | null
          title: string
          updated_at: string
          work_date: string | null
        }
        Insert: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          filed_at?: string | null
          id?: string
          kind?: string | null
          notes?: string | null
          official_deadline?: string | null
          organization_id: string
          priority?: string
          protocol_number?: string | null
          receipt_path?: string | null
          responsible_id?: string | null
          status?: string
          summary?: string | null
          title: string
          updated_at?: string
          work_date?: string | null
        }
        Update: {
          case_id?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          filed_at?: string | null
          id?: string
          kind?: string | null
          notes?: string | null
          official_deadline?: string | null
          organization_id?: string
          priority?: string
          protocol_number?: string | null
          receipt_path?: string | null
          responsible_id?: string | null
          status?: string
          summary?: string | null
          title?: string
          updated_at?: string
          work_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "petitions_case_id_organization_id_fkey"
            columns: ["case_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "petitions_client_id_organization_id_fkey"
            columns: ["client_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "petitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "petitions_responsible_id_organization_id_fkey"
            columns: ["responsible_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["user_id", "organization_id"]
          },
        ]
      }
      power_of_attorney_versions: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          power_of_attorney_id: string
          status: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          power_of_attorney_id: string
          status: string
          version: number
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          power_of_attorney_id?: string
          status?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "power_of_attorney_versions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "power_of_attorney_versions_power_of_attorney_id_organizati_fkey"
            columns: ["power_of_attorney_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "power_of_attorneys"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
      power_of_attorneys: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          client_id: string | null
          content: string
          created_at: string
          created_by: string | null
          data: Json
          generated_by: string
          id: string
          kind: string
          organization_id: string
          status: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          data?: Json
          generated_by?: string
          id?: string
          kind: string
          organization_id: string
          status?: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          client_id?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          data?: Json
          generated_by?: string
          id?: string
          kind?: string
          organization_id?: string
          status?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "power_of_attorneys_client_id_organization_id_fkey"
            columns: ["client_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "power_of_attorneys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_profiles: {
        Row: {
          address: string | null
          created_at: string
          created_by: string | null
          email: string | null
          firm: string | null
          id: string
          marital_status: string | null
          name: string
          nationality: string | null
          oab: string
          oab_uf: string
          organization_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          firm?: string | null
          id?: string
          marital_status?: string | null
          name: string
          nationality?: string | null
          oab: string
          oab_uf: string
          organization_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          firm?: string | null
          id?: string
          marital_status?: string | null
          name?: string
          nationality?: string | null
          oab?: string
          oab_uf?: string
          organization_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          current_organization_id: string | null
          email: string | null
          full_name: string | null
          id: string
          oab: string | null
          oab_uf: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_organization_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          oab?: string | null
          oab_uf?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_organization_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          oab?: string | null
          oab_uf?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_organization_id_fkey"
            columns: ["current_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          case_id: string | null
          checklist: Json
          client_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          organization_id: string
          petition_id: string | null
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          case_id?: string | null
          checklist?: Json
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          organization_id: string
          petition_id?: string | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          case_id?: string | null
          checklist?: Json
          client_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          organization_id?: string
          petition_id?: string | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_organization_id_fkey"
            columns: ["assignee_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["user_id", "organization_id"]
          },
          {
            foreignKeyName: "tasks_case_id_organization_id_fkey"
            columns: ["case_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "tasks_client_id_organization_id_fkey"
            columns: ["client_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id", "organization_id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_petition_id_organization_id_fkey"
            columns: ["petition_id", "organization_id"]
            isOneToOne: false
            referencedRelation: "petitions"
            referencedColumns: ["id", "organization_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { _token: string }; Returns: string }
      can_delete: { Args: { _org: string }; Returns: boolean }
      can_write: { Args: { _org: string }; Returns: boolean }
      create_invitation: {
        Args: {
          _email: string
          _org: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: string
      }
      create_organization: {
        Args: { _name: string; _oab?: string; _uf?: string }
        Returns: string
      }
      get_invitation: {
        Args: { _token: string }
        Returns: {
          email: string
          expired: boolean
          organization_name: string
          role: Database["public"]["Enums"]["app_role"]
          status: string
        }[]
      }
      has_org_role: {
        Args: {
          _org: string
          _roles: Database["public"]["Enums"]["app_role"][]
        }
        Returns: boolean
      }
      is_member: { Args: { _org: string }; Returns: boolean }
      refresh_my_alerts: { Args: { _org: string }; Returns: number }
      remove_member: { Args: { _membership: string }; Returns: undefined }
      revoke_invitation: { Args: { _id: string }; Returns: undefined }
      update_member_role: {
        Args: {
          _membership: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "advogado" | "assistente" | "estagiario"
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
    Enums: {
      app_role: ["admin", "advogado", "assistente", "estagiario"],
    },
  },
} as const
