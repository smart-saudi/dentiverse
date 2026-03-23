/**
 * Supabase Database Type Definitions for DentiVerse.
 *
 * IMPORTANT: This file is a hand-crafted placeholder based on schema.sql.
 * Once Supabase is running locally, regenerate with:
 *   npx supabase gen types typescript --local > src/lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: Database['public']['Enums']['user_role'];
          avatar_url: string | null;
          phone: string | null;
          country: string | null;
          city: string | null;
          timezone: string;
          preferred_lang: string;
          is_verified: boolean;
          is_active: boolean;
          stripe_account_id: string | null;
          stripe_customer_id: string | null;
          last_seen_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: Database['public']['Enums']['user_role'];
          avatar_url?: string | null;
          phone?: string | null;
          country?: string | null;
          city?: string | null;
          timezone?: string;
          preferred_lang?: string;
          is_verified?: boolean;
          is_active?: boolean;
          stripe_account_id?: string | null;
          stripe_customer_id?: string | null;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: Database['public']['Enums']['user_role'];
          avatar_url?: string | null;
          phone?: string | null;
          country?: string | null;
          city?: string | null;
          timezone?: string;
          preferred_lang?: string;
          is_verified?: boolean;
          is_active?: boolean;
          stripe_account_id?: string | null;
          stripe_customer_id?: string | null;
          last_seen_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      designer_profiles: {
        Row: {
          id: string;
          user_id: string;
          bio: string | null;
          software_skills: Json;
          specializations: Json;
          years_experience: number;
          hourly_rate: number | null;
          portfolio_urls: Json;
          sample_case_ids: Json;
          avg_rating: number;
          total_reviews: number;
          total_cases: number;
          completed_cases: number;
          avg_delivery_hours: number;
          is_available: boolean;
          is_featured: boolean;
          languages: Json;
          certifications: Json;
          response_rate: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string | null;
          software_skills?: Json;
          specializations?: Json;
          years_experience?: number;
          hourly_rate?: number | null;
          portfolio_urls?: Json;
          sample_case_ids?: Json;
          avg_rating?: number;
          total_reviews?: number;
          total_cases?: number;
          completed_cases?: number;
          avg_delivery_hours?: number;
          is_available?: boolean;
          is_featured?: boolean;
          languages?: Json;
          certifications?: Json;
          response_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string | null;
          software_skills?: Json;
          specializations?: Json;
          years_experience?: number;
          hourly_rate?: number | null;
          portfolio_urls?: Json;
          sample_case_ids?: Json;
          avg_rating?: number;
          total_reviews?: number;
          total_cases?: number;
          completed_cases?: number;
          avg_delivery_hours?: number;
          is_available?: boolean;
          is_featured?: boolean;
          languages?: Json;
          certifications?: Json;
          response_rate?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'designer_profiles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      cases: {
        Row: {
          id: string;
          client_id: string;
          designer_id: string | null;
          status: Database['public']['Enums']['case_status'];
          case_type: Database['public']['Enums']['case_type'];
          title: string;
          description: string | null;
          tooth_numbers: Json;
          material_preference: string | null;
          shade: string | null;
          scan_file_urls: Json;
          design_file_urls: Json;
          reference_images: Json;
          budget_min: number | null;
          budget_max: number | null;
          agreed_price: number | null;
          currency: string;
          deadline: string | null;
          urgency: string;
          special_instructions: string | null;
          software_required: string | null;
          output_format: string;
          max_revisions: number;
          revision_count: number;
          assigned_at: string | null;
          submitted_at: string | null;
          delivered_at: string | null;
          approved_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          designer_id?: string | null;
          status?: Database['public']['Enums']['case_status'];
          case_type: Database['public']['Enums']['case_type'];
          title: string;
          description?: string | null;
          tooth_numbers?: Json;
          material_preference?: string | null;
          shade?: string | null;
          scan_file_urls?: Json;
          design_file_urls?: Json;
          reference_images?: Json;
          budget_min?: number | null;
          budget_max?: number | null;
          agreed_price?: number | null;
          currency?: string;
          deadline?: string | null;
          urgency?: string;
          special_instructions?: string | null;
          software_required?: string | null;
          output_format?: string;
          max_revisions?: number;
          revision_count?: number;
          assigned_at?: string | null;
          submitted_at?: string | null;
          delivered_at?: string | null;
          approved_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          designer_id?: string | null;
          status?: Database['public']['Enums']['case_status'];
          case_type?: Database['public']['Enums']['case_type'];
          title?: string;
          description?: string | null;
          tooth_numbers?: Json;
          material_preference?: string | null;
          shade?: string | null;
          scan_file_urls?: Json;
          design_file_urls?: Json;
          reference_images?: Json;
          budget_min?: number | null;
          budget_max?: number | null;
          agreed_price?: number | null;
          currency?: string;
          deadline?: string | null;
          urgency?: string;
          special_instructions?: string | null;
          software_required?: string | null;
          output_format?: string;
          max_revisions?: number;
          revision_count?: number;
          assigned_at?: string | null;
          submitted_at?: string | null;
          delivered_at?: string | null;
          approved_at?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cases_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cases_designer_id_fkey';
            columns: ['designer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      proposals: {
        Row: {
          id: string;
          case_id: string;
          designer_id: string;
          price: number;
          estimated_hours: number;
          message: string;
          status: Database['public']['Enums']['proposal_status'];
          accepted_at: string | null;
          rejected_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          designer_id: string;
          price: number;
          estimated_hours: number;
          message: string;
          status?: Database['public']['Enums']['proposal_status'];
          accepted_at?: string | null;
          rejected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          designer_id?: string;
          price?: number;
          estimated_hours?: number;
          message?: string;
          status?: Database['public']['Enums']['proposal_status'];
          accepted_at?: string | null;
          rejected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'proposals_case_id_fkey';
            columns: ['case_id'];
            isOneToOne: false;
            referencedRelation: 'cases';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'proposals_designer_id_fkey';
            columns: ['designer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      design_versions: {
        Row: {
          id: string;
          case_id: string;
          designer_id: string;
          version_number: number;
          file_urls: Json;
          thumbnail_url: string | null;
          preview_model_url: string | null;
          notes: string | null;
          status: Database['public']['Enums']['design_version_status'];
          revision_feedback: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          designer_id: string;
          version_number: number;
          file_urls?: Json;
          thumbnail_url?: string | null;
          preview_model_url?: string | null;
          notes?: string | null;
          status?: Database['public']['Enums']['design_version_status'];
          revision_feedback?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          designer_id?: string;
          version_number?: number;
          file_urls?: Json;
          thumbnail_url?: string | null;
          preview_model_url?: string | null;
          notes?: string | null;
          status?: Database['public']['Enums']['design_version_status'];
          revision_feedback?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'design_versions_case_id_fkey';
            columns: ['case_id'];
            isOneToOne: false;
            referencedRelation: 'cases';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'design_versions_designer_id_fkey';
            columns: ['designer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          case_id: string;
          client_id: string;
          designer_id: string;
          amount: number;
          platform_fee: number;
          designer_payout: number;
          currency: string;
          fee_percentage: number;
          status: Database['public']['Enums']['payment_status'];
          stripe_payment_intent_id: string | null;
          stripe_charge_id: string | null;
          stripe_transfer_id: string | null;
          stripe_refund_id: string | null;
          held_at: string | null;
          released_at: string | null;
          refunded_at: string | null;
          failure_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          client_id: string;
          designer_id: string;
          amount: number;
          platform_fee: number;
          designer_payout: number;
          currency?: string;
          fee_percentage?: number;
          status?: Database['public']['Enums']['payment_status'];
          stripe_payment_intent_id?: string | null;
          stripe_charge_id?: string | null;
          stripe_transfer_id?: string | null;
          stripe_refund_id?: string | null;
          held_at?: string | null;
          released_at?: string | null;
          refunded_at?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          client_id?: string;
          designer_id?: string;
          amount?: number;
          platform_fee?: number;
          designer_payout?: number;
          currency?: string;
          fee_percentage?: number;
          status?: Database['public']['Enums']['payment_status'];
          stripe_payment_intent_id?: string | null;
          stripe_charge_id?: string | null;
          stripe_transfer_id?: string | null;
          stripe_refund_id?: string | null;
          held_at?: string | null;
          released_at?: string | null;
          refunded_at?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_case_id_fkey';
            columns: ['case_id'];
            isOneToOne: true;
            referencedRelation: 'cases';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_client_id_fkey';
            columns: ['client_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_designer_id_fkey';
            columns: ['designer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      reviews: {
        Row: {
          id: string;
          case_id: string;
          reviewer_id: string;
          designer_id: string;
          overall_rating: number;
          accuracy_rating: number;
          speed_rating: number;
          communication_rating: number;
          comment: string | null;
          is_public: boolean;
          designer_response: string | null;
          responded_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          reviewer_id: string;
          designer_id: string;
          overall_rating: number;
          accuracy_rating: number;
          speed_rating: number;
          communication_rating: number;
          comment?: string | null;
          is_public?: boolean;
          designer_response?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          reviewer_id?: string;
          designer_id?: string;
          overall_rating?: number;
          accuracy_rating?: number;
          speed_rating?: number;
          communication_rating?: number;
          comment?: string | null;
          is_public?: boolean;
          designer_response?: string | null;
          responded_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reviews_case_id_fkey';
            columns: ['case_id'];
            isOneToOne: true;
            referencedRelation: 'cases';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_reviewer_id_fkey';
            columns: ['reviewer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_designer_id_fkey';
            columns: ['designer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          id: string;
          case_id: string;
          sender_id: string;
          content: string;
          attachment_urls: Json;
          is_read: boolean;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          case_id: string;
          sender_id: string;
          content: string;
          attachment_urls?: Json;
          is_read?: boolean;
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          case_id?: string;
          sender_id?: string;
          content?: string;
          attachment_urls?: Json;
          is_read?: boolean;
          is_system?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_case_id_fkey';
            columns: ['case_id'];
            isOneToOne: false;
            referencedRelation: 'cases';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: Database['public']['Enums']['notification_type'];
          title: string;
          body: string | null;
          case_id: string | null;
          action_url: string | null;
          is_read: boolean;
          is_emailed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: Database['public']['Enums']['notification_type'];
          title: string;
          body?: string | null;
          case_id?: string | null;
          action_url?: string | null;
          is_read?: boolean;
          is_emailed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: Database['public']['Enums']['notification_type'];
          title?: string;
          body?: string | null;
          case_id?: string | null;
          action_url?: string | null;
          is_read?: boolean;
          is_emailed?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_case_id_fkey';
            columns: ['case_id'];
            isOneToOne: false;
            referencedRelation: 'cases';
            referencedColumns: ['id'];
          },
        ];
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_data: Json | null;
          new_data: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string;
          old_data?: Json | null;
          new_data?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_log_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'DENTIST' | 'LAB' | 'DESIGNER' | 'ADMIN';
      case_status:
        | 'DRAFT'
        | 'OPEN'
        | 'ASSIGNED'
        | 'IN_PROGRESS'
        | 'REVIEW'
        | 'REVISION'
        | 'APPROVED'
        | 'COMPLETED'
        | 'CANCELLED'
        | 'DISPUTED';
      case_type:
        | 'CROWN'
        | 'BRIDGE'
        | 'IMPLANT'
        | 'VENEER'
        | 'INLAY'
        | 'ONLAY'
        | 'DENTURE'
        | 'OTHER';
      proposal_status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
      design_version_status: 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUESTED';
      payment_status:
        | 'PENDING'
        | 'HELD'
        | 'RELEASED'
        | 'REFUNDED'
        | 'DISPUTED';
      notification_type:
        | 'NEW_PROPOSAL'
        | 'DESIGN_SUBMITTED'
        | 'REVISION_REQUESTED'
        | 'PAYMENT_RELEASED'
        | 'NEW_MESSAGE'
        | 'CASE_ASSIGNED'
        | 'CASE_COMPLETED'
        | 'REVIEW_RECEIVED';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
