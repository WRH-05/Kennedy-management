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
      archive_requests: {
        Row: {
          approved_by: string | null
          approved_by_name: string | null
          approved_date: string | null
          created_at: string | null
          entity_id: string
          entity_name: string
          entity_type: string
          id: string
          reason: string | null
          requested_by: string | null
          requested_by_name: string | null
          school_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_by_name?: string | null
          approved_date?: string | null
          created_at?: string | null
          entity_id: string
          entity_name: string
          entity_type: string
          id?: string
          reason?: string | null
          requested_by?: string | null
          requested_by_name?: string | null
          school_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_by_name?: string | null
          approved_date?: string | null
          created_at?: string | null
          entity_id?: string
          entity_name?: string
          entity_type?: string
          id?: string
          reason?: string | null
          requested_by?: string | null
          requested_by_name?: string | null
          school_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      attendance: {
        Row: {
          attendance_date: string | null
          attended: boolean | null
          course_id: string
          created_at: string | null
          id: string
          school_id: string
          student_id: string
          updated_at: string | null
          week: number
        }
        Insert: {
          attendance_date?: string | null
          attended?: boolean | null
          course_id: string
          created_at?: string | null
          id?: string
          school_id: string
          student_id: string
          updated_at?: string | null
          week: number
        }
        Update: {
          attendance_date?: string | null
          attended?: boolean | null
          course_id?: string
          created_at?: string | null
          id?: string
          school_id?: string
          student_id?: string
          updated_at?: string | null
          week?: number
        }
        Relationships: []
      }
      course_instances: {
        Row: {
          archived: boolean | null
          archived_date: string | null
          course_type: string | null
          created_at: string | null
          duration: number | null
          id: string
          monthly_price: number | null
          percentage_cut: number | null
          price: number | null
          schedule: string | null
          school_id: string
          school_year: string
          status: string | null
          student_ids: string[] | null
          subject: string
          teacher_id: string | null
          teacher_name: string | null
          updated_at: string | null
        }
        Insert: {
          archived?: boolean | null
          archived_date?: string | null
          course_type?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          monthly_price?: number | null
          percentage_cut?: number | null
          price?: number | null
          schedule?: string | null
          school_id: string
          school_year: string
          status?: string | null
          student_ids?: string[] | null
          subject: string
          teacher_id?: string | null
          teacher_name?: string | null
          updated_at?: string | null
        }
        Update: {
          archived?: boolean | null
          archived_date?: string | null
          course_type?: string | null
          created_at?: string | null
          duration?: number | null
          id?: string
          monthly_price?: number | null
          percentage_cut?: number | null
          price?: number | null
          schedule?: string | null
          school_id?: string
          school_year?: string
          status?: string | null
          student_ids?: string[] | null
          subject?: string
          teacher_id?: string | null
          teacher_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          school_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["user_role"]
          school_id: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string
          token?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string
          id: string
          invited_by: string | null
          is_active: boolean | null
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          school_id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          id: string
          invited_by?: string | null
          is_active?: boolean | null
          phone: string
          role?: Database["public"]["Enums"]["user_role"]
          school_id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          phone?: string
          role?: Database["public"]["Enums"]["user_role"]
          school_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      revenue: {
        Row: {
          amount: number | null
          course: string | null
          course_id: string | null
          created_at: string | null
          id: string
          month: string | null
          paid: boolean | null
          school_id: string
          student_id: string | null
          student_name: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          course?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          month?: string | null
          paid?: boolean | null
          school_id: string
          student_id?: string | null
          student_name?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          course?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          month?: string | null
          paid?: boolean | null
          school_id?: string
          student_id?: string | null
          student_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      student_payments: {
        Row: {
          amount: number
          approved_by: string | null
          approved_date: string | null
          course_id: string | null
          created_at: string | null
          id: string
          month: string | null
          payment_date: string | null
          school_id: string
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          approved_by?: string | null
          approved_date?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          month?: string | null
          payment_date?: string | null
          school_id: string
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          approved_date?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          month?: string | null
          payment_date?: string | null
          school_id?: string
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          address: string | null
          archived: boolean | null
          archived_date: string | null
          birth_date: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          registration_fee_paid: boolean | null
          school: string | null
          school_id: string
          school_year: string | null
          specialty: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          archived?: boolean | null
          archived_date?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          registration_fee_paid?: boolean | null
          school?: string | null
          school_id: string
          school_year?: string | null
          specialty?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          archived?: boolean | null
          archived_date?: string | null
          birth_date?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          registration_fee_paid?: boolean | null
          school?: string | null
          school_id?: string
          school_year?: string | null
          specialty?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      teacher_payouts: {
        Row: {
          amount: number
          approved_by: string | null
          approved_date: string | null
          created_at: string | null
          due_date: string | null
          id: string
          month: string | null
          payment_date: string | null
          percentage: number | null
          professor_name: string | null
          school_id: string
          status: string | null
          teacher_id: string
          total_generated: number | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          month?: string | null
          payment_date?: string | null
          percentage?: number | null
          professor_name?: string | null
          school_id: string
          status?: string | null
          teacher_id: string
          total_generated?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          month?: string | null
          payment_date?: string | null
          percentage?: number | null
          professor_name?: string | null
          school_id?: string
          status?: string | null
          teacher_id?: string
          total_generated?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      teachers: {
        Row: {
          address: string | null
          archived: boolean | null
          archived_date: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          school: string | null
          school_id: string
          school_years: string[] | null
          subjects: string[] | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          archived?: boolean | null
          archived_date?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          school?: string | null
          school_id: string
          school_years?: string[] | null
          subjects?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          archived?: boolean | null
          archived_date?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          school?: string | null
          school_id?: string
          school_years?: string[] | null
          subjects?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_teacher_payout: {
        Args: { p_month: string; p_teacher_id: string }
        Returns: number
      }
      cleanup_expired_invitations: { Args: Record<string, never>; Returns: number }
      create_invitation: {
        Args: {
          p_email: string
          p_role: Database["public"]["Enums"]["user_role"]
          p_school_id: string
        }
        Returns: string
      }
      create_owner_profile_manual: {
        Args: {
          p_full_name: string
          p_phone?: string
          p_school_id: string
          p_user_id: string
        }
        Returns: Json
      }
      create_school_for_owner: {
        Args: {
          p_school_address: string
          p_school_email: string
          p_school_name: string
          p_school_phone: string
        }
        Returns: string
      }
      create_user_invitation: {
        Args: {
          p_email: string
          p_role: Database["public"]["Enums"]["user_role"]
          p_school_id?: string
        }
        Returns: string
      }
      get_current_user_school_id: { Args: Record<string, never>; Returns: string }
      get_current_user_session: { Args: Record<string, never>; Returns: Json }
      get_student_course_count: {
        Args: { p_student_id: string }
        Returns: number
      }
      get_teacher_course_count: {
        Args: { p_teacher_id: string }
        Returns: number
      }
      test_authentication_system: { Args: Record<string, never>; Returns: Json }
      user_has_any_role: {
        Args: { required_roles: string[] }
        Returns: boolean
      }
      user_has_role: { Args: { required_role: string }; Returns: boolean }
      validate_signup_data: {
        Args: {
          p_email: string
          p_invitation_token?: string
          p_school_name?: string
        }
        Returns: Json
      }
    }
    Enums: {
      user_role: "owner" | "manager" | "receptionist"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  TableName extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][TableName]["Row"]

export type TablesInsert<
  TableName extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][TableName]["Insert"]

export type TablesUpdate<
  TableName extends keyof Database["public"]["Tables"]
> = Database["public"]["Tables"][TableName]["Update"]

export type Enums<
  EnumName extends keyof Database["public"]["Enums"]
> = Database["public"]["Enums"][EnumName]
