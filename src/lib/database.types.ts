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
      audit_log: {
        Row: {
          action: string;
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          ip_address: unknown;
          new_data: Json | null;
          old_data: Json | null;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          ip_address?: unknown;
          new_data?: Json | null;
          old_data?: Json | null;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          ip_address?: unknown;
          new_data?: Json | null;
          old_data?: Json | null;
          user_agent?: string | null;
          user_id?: string | null;
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
      cases: {
        Row: {
          agreed_price: number | null;
          approved_at: string | null;
          assigned_at: string | null;
          budget_max: number | null;
          budget_min: number | null;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          case_type: Database['public']['Enums']['case_type'];
          client_id: string;
          completed_at: string | null;
          created_at: string;
          currency: string;
          deadline: string | null;
          delivered_at: string | null;
          description: string | null;
          design_file_urls: Json;
          designer_id: string | null;
          id: string;
          material_preference: string | null;
          max_revisions: number;
          metadata: Json;
          output_format: string | null;
          reference_images: Json;
          revision_count: number;
          scan_file_urls: Json;
          shade: string | null;
          software_required: string | null;
          special_instructions: string | null;
          status: Database['public']['Enums']['case_status'];
          submitted_at: string | null;
          title: string;
          tooth_numbers: Json;
          updated_at: string;
          urgency: string | null;
        };
        Insert: {
          agreed_price?: number | null;
          approved_at?: string | null;
          assigned_at?: string | null;
          budget_max?: number | null;
          budget_min?: number | null;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          case_type: Database['public']['Enums']['case_type'];
          client_id: string;
          completed_at?: string | null;
          created_at?: string;
          currency?: string;
          deadline?: string | null;
          delivered_at?: string | null;
          description?: string | null;
          design_file_urls?: Json;
          designer_id?: string | null;
          id?: string;
          material_preference?: string | null;
          max_revisions?: number;
          metadata?: Json;
          output_format?: string | null;
          reference_images?: Json;
          revision_count?: number;
          scan_file_urls?: Json;
          shade?: string | null;
          software_required?: string | null;
          special_instructions?: string | null;
          status?: Database['public']['Enums']['case_status'];
          submitted_at?: string | null;
          title: string;
          tooth_numbers?: Json;
          updated_at?: string;
          urgency?: string | null;
        };
        Update: {
          agreed_price?: number | null;
          approved_at?: string | null;
          assigned_at?: string | null;
          budget_max?: number | null;
          budget_min?: number | null;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          case_type?: Database['public']['Enums']['case_type'];
          client_id?: string;
          completed_at?: string | null;
          created_at?: string;
          currency?: string;
          deadline?: string | null;
          delivered_at?: string | null;
          description?: string | null;
          design_file_urls?: Json;
          designer_id?: string | null;
          id?: string;
          material_preference?: string | null;
          max_revisions?: number;
          metadata?: Json;
          output_format?: string | null;
          reference_images?: Json;
          revision_count?: number;
          scan_file_urls?: Json;
          shade?: string | null;
          software_required?: string | null;
          special_instructions?: string | null;
          status?: Database['public']['Enums']['case_status'];
          submitted_at?: string | null;
          title?: string;
          tooth_numbers?: Json;
          updated_at?: string;
          urgency?: string | null;
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
      design_versions: {
        Row: {
          case_id: string;
          created_at: string;
          designer_id: string;
          file_urls: Json;
          id: string;
          notes: string | null;
          preview_model_url: string | null;
          reviewed_at: string | null;
          revision_feedback: string | null;
          status: Database['public']['Enums']['design_version_status'];
          thumbnail_url: string | null;
          version_number: number;
        };
        Insert: {
          case_id: string;
          created_at?: string;
          designer_id: string;
          file_urls?: Json;
          id?: string;
          notes?: string | null;
          preview_model_url?: string | null;
          reviewed_at?: string | null;
          revision_feedback?: string | null;
          status?: Database['public']['Enums']['design_version_status'];
          thumbnail_url?: string | null;
          version_number: number;
        };
        Update: {
          case_id?: string;
          created_at?: string;
          designer_id?: string;
          file_urls?: Json;
          id?: string;
          notes?: string | null;
          preview_model_url?: string | null;
          reviewed_at?: string | null;
          revision_feedback?: string | null;
          status?: Database['public']['Enums']['design_version_status'];
          thumbnail_url?: string | null;
          version_number?: number;
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
      designer_profiles: {
        Row: {
          avg_delivery_hours: number | null;
          avg_rating: number | null;
          bio: string | null;
          certifications: Json;
          completed_cases: number;
          created_at: string;
          hourly_rate: number | null;
          id: string;
          is_available: boolean;
          is_featured: boolean;
          languages: Json;
          portfolio_urls: Json;
          response_rate: number | null;
          sample_case_ids: Json;
          software_skills: Json;
          specializations: Json;
          total_cases: number;
          total_reviews: number;
          updated_at: string;
          user_id: string;
          years_experience: number | null;
        };
        Insert: {
          avg_delivery_hours?: number | null;
          avg_rating?: number | null;
          bio?: string | null;
          certifications?: Json;
          completed_cases?: number;
          created_at?: string;
          hourly_rate?: number | null;
          id?: string;
          is_available?: boolean;
          is_featured?: boolean;
          languages?: Json;
          portfolio_urls?: Json;
          response_rate?: number | null;
          sample_case_ids?: Json;
          software_skills?: Json;
          specializations?: Json;
          total_cases?: number;
          total_reviews?: number;
          updated_at?: string;
          user_id: string;
          years_experience?: number | null;
        };
        Update: {
          avg_delivery_hours?: number | null;
          avg_rating?: number | null;
          bio?: string | null;
          certifications?: Json;
          completed_cases?: number;
          created_at?: string;
          hourly_rate?: number | null;
          id?: string;
          is_available?: boolean;
          is_featured?: boolean;
          languages?: Json;
          portfolio_urls?: Json;
          response_rate?: number | null;
          sample_case_ids?: Json;
          software_skills?: Json;
          specializations?: Json;
          total_cases?: number;
          total_reviews?: number;
          updated_at?: string;
          user_id?: string;
          years_experience?: number | null;
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
      messages: {
        Row: {
          attachment_urls: Json;
          case_id: string;
          content: string;
          created_at: string;
          id: string;
          is_read: boolean;
          is_system: boolean;
          sender_id: string;
        };
        Insert: {
          attachment_urls?: Json;
          case_id: string;
          content: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          is_system?: boolean;
          sender_id: string;
        };
        Update: {
          attachment_urls?: Json;
          case_id?: string;
          content?: string;
          created_at?: string;
          id?: string;
          is_read?: boolean;
          is_system?: boolean;
          sender_id?: string;
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
          action_url: string | null;
          body: string | null;
          case_id: string | null;
          created_at: string;
          id: string;
          is_emailed: boolean;
          is_read: boolean;
          title: string;
          type: Database['public']['Enums']['notification_type'];
          user_id: string;
        };
        Insert: {
          action_url?: string | null;
          body?: string | null;
          case_id?: string | null;
          created_at?: string;
          id?: string;
          is_emailed?: boolean;
          is_read?: boolean;
          title: string;
          type: Database['public']['Enums']['notification_type'];
          user_id: string;
        };
        Update: {
          action_url?: string | null;
          body?: string | null;
          case_id?: string | null;
          created_at?: string;
          id?: string;
          is_emailed?: boolean;
          is_read?: boolean;
          title?: string;
          type?: Database['public']['Enums']['notification_type'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_case_id_fkey';
            columns: ['case_id'];
            isOneToOne: false;
            referencedRelation: 'cases';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          amount: number;
          case_id: string;
          client_id: string;
          created_at: string;
          currency: string;
          designer_id: string;
          designer_payout: number;
          failure_reason: string | null;
          fee_percentage: number;
          held_at: string | null;
          id: string;
          platform_fee: number;
          refunded_at: string | null;
          released_at: string | null;
          status: Database['public']['Enums']['payment_status'];
          stripe_charge_id: string | null;
          stripe_payment_intent_id: string | null;
          stripe_refund_id: string | null;
          stripe_transfer_id: string | null;
          updated_at: string;
        };
        Insert: {
          amount: number;
          case_id: string;
          client_id: string;
          created_at?: string;
          currency?: string;
          designer_id: string;
          designer_payout: number;
          failure_reason?: string | null;
          fee_percentage?: number;
          held_at?: string | null;
          id?: string;
          platform_fee: number;
          refunded_at?: string | null;
          released_at?: string | null;
          status?: Database['public']['Enums']['payment_status'];
          stripe_charge_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_refund_id?: string | null;
          stripe_transfer_id?: string | null;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          case_id?: string;
          client_id?: string;
          created_at?: string;
          currency?: string;
          designer_id?: string;
          designer_payout?: number;
          failure_reason?: string | null;
          fee_percentage?: number;
          held_at?: string | null;
          id?: string;
          platform_fee?: number;
          refunded_at?: string | null;
          released_at?: string | null;
          status?: Database['public']['Enums']['payment_status'];
          stripe_charge_id?: string | null;
          stripe_payment_intent_id?: string | null;
          stripe_refund_id?: string | null;
          stripe_transfer_id?: string | null;
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
      proposals: {
        Row: {
          accepted_at: string | null;
          case_id: string;
          created_at: string;
          designer_id: string;
          estimated_hours: number;
          id: string;
          message: string;
          price: number;
          rejected_at: string | null;
          status: Database['public']['Enums']['proposal_status'];
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          case_id: string;
          created_at?: string;
          designer_id: string;
          estimated_hours: number;
          id?: string;
          message: string;
          price: number;
          rejected_at?: string | null;
          status?: Database['public']['Enums']['proposal_status'];
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          case_id?: string;
          created_at?: string;
          designer_id?: string;
          estimated_hours?: number;
          id?: string;
          message?: string;
          price?: number;
          rejected_at?: string | null;
          status?: Database['public']['Enums']['proposal_status'];
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
      reviews: {
        Row: {
          accuracy_rating: number;
          case_id: string;
          comment: string | null;
          communication_rating: number;
          created_at: string;
          designer_id: string;
          designer_response: string | null;
          id: string;
          is_public: boolean;
          overall_rating: number;
          responded_at: string | null;
          reviewer_id: string;
          speed_rating: number;
          updated_at: string;
        };
        Insert: {
          accuracy_rating: number;
          case_id: string;
          comment?: string | null;
          communication_rating: number;
          created_at?: string;
          designer_id: string;
          designer_response?: string | null;
          id?: string;
          is_public?: boolean;
          overall_rating: number;
          responded_at?: string | null;
          reviewer_id: string;
          speed_rating: number;
          updated_at?: string;
        };
        Update: {
          accuracy_rating?: number;
          case_id?: string;
          comment?: string | null;
          communication_rating?: number;
          created_at?: string;
          designer_id?: string;
          designer_response?: string | null;
          id?: string;
          is_public?: boolean;
          overall_rating?: number;
          responded_at?: string | null;
          reviewer_id?: string;
          speed_rating?: number;
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
            foreignKeyName: 'reviews_designer_id_fkey';
            columns: ['designer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reviews_reviewer_id_fkey';
            columns: ['reviewer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          city: string | null;
          country: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          is_active: boolean;
          is_verified: boolean;
          last_seen_at: string | null;
          phone: string | null;
          preferred_lang: string | null;
          role: Database['public']['Enums']['user_role'];
          stripe_account_id: string | null;
          stripe_customer_id: string | null;
          timezone: string | null;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id: string;
          is_active?: boolean;
          is_verified?: boolean;
          last_seen_at?: string | null;
          phone?: string | null;
          preferred_lang?: string | null;
          role: Database['public']['Enums']['user_role'];
          stripe_account_id?: string | null;
          stripe_customer_id?: string | null;
          timezone?: string | null;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          is_verified?: boolean;
          last_seen_at?: string | null;
          phone?: string | null;
          preferred_lang?: string | null;
          role?: Database['public']['Enums']['user_role'];
          stripe_account_id?: string | null;
          stripe_customer_id?: string | null;
          timezone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      show_limit: { Args: never; Returns: number };
      show_trgm: { Args: { '': string }; Returns: string[] };
    };
    Enums: {
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
      design_version_status: 'SUBMITTED' | 'APPROVED' | 'REVISION_REQUESTED';
      notification_type:
        | 'NEW_PROPOSAL'
        | 'DESIGN_SUBMITTED'
        | 'REVISION_REQUESTED'
        | 'PAYMENT_RELEASED'
        | 'NEW_MESSAGE'
        | 'CASE_ASSIGNED'
        | 'CASE_COMPLETED'
        | 'REVIEW_RECEIVED';
      payment_status: 'PENDING' | 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';
      proposal_status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
      user_role: 'DENTIST' | 'LAB' | 'DESIGNER' | 'ADMIN';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      case_status: [
        'DRAFT',
        'OPEN',
        'ASSIGNED',
        'IN_PROGRESS',
        'REVIEW',
        'REVISION',
        'APPROVED',
        'COMPLETED',
        'CANCELLED',
        'DISPUTED',
      ],
      case_type: [
        'CROWN',
        'BRIDGE',
        'IMPLANT',
        'VENEER',
        'INLAY',
        'ONLAY',
        'DENTURE',
        'OTHER',
      ],
      design_version_status: ['SUBMITTED', 'APPROVED', 'REVISION_REQUESTED'],
      notification_type: [
        'NEW_PROPOSAL',
        'DESIGN_SUBMITTED',
        'REVISION_REQUESTED',
        'PAYMENT_RELEASED',
        'NEW_MESSAGE',
        'CASE_ASSIGNED',
        'CASE_COMPLETED',
        'REVIEW_RECEIVED',
      ],
      payment_status: ['PENDING', 'HELD', 'RELEASED', 'REFUNDED', 'DISPUTED'],
      proposal_status: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
      user_role: ['DENTIST', 'LAB', 'DESIGNER', 'ADMIN'],
    },
  },
} as const;
