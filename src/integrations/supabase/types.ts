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
  public: {
    Tables: {
      bitacora: {
        Row: {
          accion: string
          antes: string | null
          autor_id: string | null
          creado_en: string
          despues: string | null
          funcionalidad_id: string | null
          id: number
        }
        Insert: {
          accion: string
          antes?: string | null
          autor_id?: string | null
          creado_en?: string
          despues?: string | null
          funcionalidad_id?: string | null
          id?: number
        }
        Update: {
          accion?: string
          antes?: string | null
          autor_id?: string | null
          creado_en?: string
          despues?: string | null
          funcionalidad_id?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "bitacora_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bitacora_funcionalidad_id_fkey"
            columns: ["funcionalidad_id"]
            isOneToOne: false
            referencedRelation: "funcionalidades"
            referencedColumns: ["id"]
          },
        ]
      }
      comentarios: {
        Row: {
          autor_id: string
          creado_en: string
          cuerpo: string
          funcionalidad_id: string
          id: string
        }
        Insert: {
          autor_id: string
          creado_en?: string
          cuerpo: string
          funcionalidad_id: string
          id?: string
        }
        Update: {
          autor_id?: string
          creado_en?: string
          cuerpo?: string
          funcionalidad_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_autor_id_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comentarios_funcionalidad_id_fkey"
            columns: ["funcionalidad_id"]
            isOneToOne: false
            referencedRelation: "funcionalidades"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionalidades: {
        Row: {
          codigo: string
          detalle: string | null
          horas: number | null
          id: string
          orden: number
          proyecto_id: string
          titulo: string
        }
        Insert: {
          codigo: string
          detalle?: string | null
          horas?: number | null
          id?: string
          orden?: number
          proyecto_id: string
          titulo: string
        }
        Update: {
          codigo?: string
          detalle?: string | null
          horas?: number | null
          id?: string
          orden?: number
          proyecto_id?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "funcionalidades_proyecto_id_fkey"
            columns: ["proyecto_id"]
            isOneToOne: false
            referencedRelation: "proyectos"
            referencedColumns: ["id"]
          },
        ]
      }
      invitados: {
        Row: {
          email: string
          lado: Database["public"]["Enums"]["org_side"]
          nombre: string | null
        }
        Insert: {
          email: string
          lado: Database["public"]["Enums"]["org_side"]
          nombre?: string | null
        }
        Update: {
          email?: string
          lado?: Database["public"]["Enums"]["org_side"]
          nombre?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          creado_en: string
          email: string
          id: string
          lado: Database["public"]["Enums"]["org_side"]
          nombre: string | null
        }
        Insert: {
          creado_en?: string
          email: string
          id: string
          lado?: Database["public"]["Enums"]["org_side"]
          nombre?: string | null
        }
        Update: {
          creado_en?: string
          email?: string
          id?: string
          lado?: Database["public"]["Enums"]["org_side"]
          nombre?: string | null
        }
        Relationships: []
      }
      proyectos: {
        Row: {
          bajada: string | null
          color: string
          descripcion: string | null
          id: string
          nombre: string
          orden: number
          slug: string
        }
        Insert: {
          bajada?: string | null
          color: string
          descripcion?: string | null
          id?: string
          nombre: string
          orden?: number
          slug: string
        }
        Update: {
          bajada?: string | null
          color?: string
          descripcion?: string | null
          id?: string
          nombre?: string
          orden?: number
          slug?: string
        }
        Relationships: []
      }
      validaciones: {
        Row: {
          actualizado_en: string
          actualizado_por: string | null
          estado: Database["public"]["Enums"]["estado_funcionalidad"]
          funcionalidad_id: string
        }
        Insert: {
          actualizado_en?: string
          actualizado_por?: string | null
          estado?: Database["public"]["Enums"]["estado_funcionalidad"]
          funcionalidad_id: string
        }
        Update: {
          actualizado_en?: string
          actualizado_por?: string | null
          estado?: Database["public"]["Enums"]["estado_funcionalidad"]
          funcionalidad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "validaciones_actualizado_por_fkey"
            columns: ["actualizado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "validaciones_funcionalidad_id_fkey"
            columns: ["funcionalidad_id"]
            isOneToOne: true
            referencedRelation: "funcionalidades"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      asegurar_perfil: {
        Args: never
        Returns: {
          creado_en: string
          email: string
          id: string
          lado: Database["public"]["Enums"]["org_side"]
          nombre: string | null
        }
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      estado_funcionalidad: "pendiente" | "validado" | "con_cambios" | "no_va"
      org_side: "dac" | "digital_builders"
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
      estado_funcionalidad: ["pendiente", "validado", "con_cambios", "no_va"],
      org_side: ["dac", "digital_builders"],
    },
  },
} as const
