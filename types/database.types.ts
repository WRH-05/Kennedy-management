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
          approved_date: string | null
          created_at: string | null
          entity_id: string
          entity_name: string
          entity_type: string
          id: string
          reason: string | null
          requested_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          entity_id: string
          entity_name: string
          entity_type: string
          id?: string
          reason?: string | null
          requested_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_date?: string | null
          created_at?: string | null
          entity_id?: string
          entity_name?: string
          entity_type?: string
          id?: string
          reason?: string | null
          requested_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      billing_periods: {
        Row: {
          closed_at: string | null
          created_at: string | null
          end_date: string | null
          id: string
          period: string
          period_name: string | null
          start_date: string | null
          status: string | null
        }
        Insert: {
          closed_at?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          period: string
          period_name?: string | null
          start_date?: string | null
          status?: string | null
        }
        Update: {
          closed_at?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          period?: string
          period_name?: string | null
          start_date?: string | null
          status?: string | null
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          course_id: string
          enrolled_at: string
          student_id: string
        }
        Insert: {
          course_id: string
          enrolled_at?: string
          student_id: string
        }
        Update: {
          course_id?: string
          enrolled_at?: string
          student_id?: string
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
          school_year: string
          status: string | null
          subject: string
          teacher_id: string | null
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
          school_year: string
          status?: string | null
          subject: string
          teacher_id?: string | null
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
          school_year?: string
          status?: string | null
          subject?: string
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      course_sessions: {
        Row: {
          course_id: string
          ends_at: string | null
          id: string
          starts_at: string
        }
        Insert: {
          course_id: string
          ends_at?: string | null
          id?: string
          starts_at: string
        }
        Update: {
          course_id?: string
          ends_at?: string | null
          id?: string
          starts_at?: string
        }
        Relationships: []
      }
      invitations: {
        Row: {
          accepted_at: string | null
          canceled_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["user_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          canceled_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["user_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          canceled_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["user_role"]
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
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name: string
          id: string
          invited_by?: string | null
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          invited_by?: string | null
          is_active?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      session_attendance: {
        Row: {
          billing_period_id: string | null
          marked_at: string
          session_id: string
          status: string
          student_id: string
        }
        Insert: {
          billing_period_id?: string | null
          marked_at?: string
          session_id: string
          status?: string
          student_id: string
        }
        Update: {
          billing_period_id?: string | null
          marked_at?: string
          session_id?: string
          status?: string
          student_id?: string
        }
        Relationships: []
      }
      student_payments: {
        Row: {
          amount: number
          approved_by: string | null
          approved_date: string | null
          billing_period_id: string | null
          course_id: string | null
          created_at: string | null
          enrollment_status: string | null
          id: string
          join_date: string | null
          leave_date: string | null
          month: string | null
          payment_date: string | null
          recorded_by_id: string | null
          status: string | null
          student_id: string
          updated_at: string | null
        }
        Insert: {
          amount?: number
          approved_by?: string | null
          approved_date?: string | null
          billing_period_id?: string | null
          course_id?: string | null
          created_at?: string | null
          enrollment_status?: string | null
          id?: string
          join_date?: string | null
          leave_date?: string | null
          month?: string | null
          payment_date?: string | null
          recorded_by_id?: string | null
          status?: string | null
          student_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          approved_date?: string | null
          billing_period_id?: string | null
          course_id?: string | null
          created_at?: string | null
          enrollment_status?: string | null
          id?: string
          join_date?: string | null
          leave_date?: string | null
          month?: string | null
          payment_date?: string | null
          recorded_by_id?: string | null
          status?: string | null
          student_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          name: string
          birth_date: string | null
          phone: string | null
          email: string | null
          address: string | null
          school: string | null
          school_year: string | null
          specialty: string | null
          registration_fee_paid: boolean
          archived: boolean
          archived_date: string | null
          created_at: string | null
          updated_at: string | null
          school_level: string | null
        }
        Insert: {
          name: string
          birth_date: string | null
          phone: string | null
          email: string | null
          address: string | null
          school: string | null
          school_year: string | null
          specialty: string | null
          registration_fee_paid: boolean
          archived: boolean
          archived_date: string | null
          created_at?: string | null
          school_level: string | null
          updated_at?: string | null
        }
        Update: {
          id: string
          name: string
          birth_date: string | null
          phone: string | null
          email: string | null
          address: string | null
          school: string | null
          school_year: string | null
          specialty: string | null
          registration_fee_paid: boolean
          archived: boolean
          archived_date: string | null
          created_at?: string | null
          school_level: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      teacher_payouts: {
        Row: {
          amount: number
          approved_by: string | null
          approved_date: string | null
          billing_period_id: string | null
          created_at: string | null
          due_date: string | null
          id: string
          month: string | null
          payment_date: string | null
          percentage: number | null
          recorded_by_id: string | null
          status: string | null
          teacher_id: string
          total_generated: number | null
          updated_at: string | null
        }
        Insert: {
          amount?: number
          approved_by?: string | null
          approved_date?: string | null
          billing_period_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          month?: string | null
          payment_date?: string | null
          percentage?: number | null
          recorded_by_id?: string | null
          status?: string | null
          teacher_id: string
          total_generated?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          approved_date?: string | null
          billing_period_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          month?: string | null
          payment_date?: string | null
          percentage?: number | null
          recorded_by_id?: string | null
          status?: string | null
          teacher_id?: string
          total_generated?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      teachers: {
        Row: {
          id: string
          name: string
          phone: string | null
          email: string | null
          address: string | null
          school: string | null
          school_years: string[] | null
          subjects: string[] | null
          archived: boolean | null
          archived_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          address?: string | null
          archived?: boolean | null
          archived_date?: string | null
          created_at?: string | null
          email?: string | null
          name: string
          phone?: string | null
          school?: string | null
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
      [_ in never]: never
    }
    Enums: {
      user_role: "manager" | "receptionist"
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
