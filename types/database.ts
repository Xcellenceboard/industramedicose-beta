export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "patient" | "doctor" | "admin";
export type ConsultationStatus =
  | "intake"
  | "ready_for_review"
  | "in_review"
  | "approved"
  | "closed";
export type ConsultationUrgency = "routine" | "attention" | "urgent";
export type MessageRole = "patient" | "agent";
export type MessageInputMode = "voice" | "text";
export type DocumentStatus = "uploaded" | "processing" | "extracted" | "failed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          preferred_language: "en" | "hi";
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: UserRole;
          preferred_language?: "en" | "hi";
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: UserRole;
          preferred_language?: "en" | "hi";
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      doctors: {
        Row: {
          id: string;
          profile_id: string;
          specialization: string;
          hospital: string;
          registration_no_demo: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          specialization: string;
          hospital: string;
          registration_no_demo: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          specialization?: string;
          hospital?: string;
          registration_no_demo?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "doctors_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      patients: {
        Row: {
          id: string;
          profile_id: string;
          age: number | null;
          sex: "male" | "female" | "other" | null;
          blood_group: string | null;
          known_allergies: string[];
          chronic_conditions: string[];
          consent_given: boolean;
          consent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          age?: number | null;
          sex?: "male" | "female" | "other" | null;
          blood_group?: string | null;
          known_allergies?: string[];
          chronic_conditions?: string[];
          consent_given?: boolean;
          consent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          age?: number | null;
          sex?: "male" | "female" | "other" | null;
          blood_group?: string | null;
          known_allergies?: string[];
          chronic_conditions?: string[];
          consent_given?: boolean;
          consent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "patients_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      consultations: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string | null;
          status: ConsultationStatus;
          urgency: ConsultationUrgency;
          language: string;
          started_at: string;
          approved_at: string | null;
          intake_duration_seconds: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          doctor_id?: string | null;
          status?: ConsultationStatus;
          urgency?: ConsultationUrgency;
          language?: string;
          started_at?: string;
          approved_at?: string | null;
          intake_duration_seconds?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          doctor_id?: string | null;
          status?: ConsultationStatus;
          urgency?: ConsultationUrgency;
          language?: string;
          started_at?: string;
          approved_at?: string | null;
          intake_duration_seconds?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "consultations_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "consultations_doctor_id_fkey";
            columns: ["doctor_id"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          }
        ];
      };
      intake_messages: {
        Row: {
          id: string;
          consultation_id: string;
          role: MessageRole;
          content: string;
          input_mode: MessageInputMode;
          language: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          consultation_id: string;
          role: MessageRole;
          content: string;
          input_mode?: MessageInputMode;
          language?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          consultation_id?: string;
          role?: MessageRole;
          content?: string;
          input_mode?: MessageInputMode;
          language?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "intake_messages_consultation_id_fkey";
            columns: ["consultation_id"];
            isOneToOne: false;
            referencedRelation: "consultations";
            referencedColumns: ["id"];
          }
        ];
      };
      clinical_summaries: {
        Row: {
          id: string;
          consultation_id: string;
          chief_complaint: string | null;
          symptom_duration: string | null;
          history_of_present_illness: string | null;
          past_history: string | null;
          medications: Json;
          allergies: Json;
          red_flags: Json;
          missing_info: Json;
          ai_draft_note: string | null;
          doctor_edited_note: string | null;
          is_verified: boolean;
          verified_by: string | null;
          verified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          consultation_id: string;
          chief_complaint?: string | null;
          symptom_duration?: string | null;
          history_of_present_illness?: string | null;
          past_history?: string | null;
          medications?: Json;
          allergies?: Json;
          red_flags?: Json;
          missing_info?: Json;
          ai_draft_note?: string | null;
          doctor_edited_note?: string | null;
          is_verified?: boolean;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          consultation_id?: string;
          chief_complaint?: string | null;
          symptom_duration?: string | null;
          history_of_present_illness?: string | null;
          past_history?: string | null;
          medications?: Json;
          allergies?: Json;
          red_flags?: Json;
          missing_info?: Json;
          ai_draft_note?: string | null;
          doctor_edited_note?: string | null;
          is_verified?: boolean;
          verified_by?: string | null;
          verified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "clinical_summaries_consultation_id_fkey";
            columns: ["consultation_id"];
            isOneToOne: true;
            referencedRelation: "consultations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clinical_summaries_verified_by_fkey";
            columns: ["verified_by"];
            isOneToOne: false;
            referencedRelation: "doctors";
            referencedColumns: ["id"];
          }
        ];
      };
      documents: {
        Row: {
          id: string;
          consultation_id: string | null;
          patient_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          ocr_text: string | null;
          extracted: Json;
          status: DocumentStatus;
          confidence: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          consultation_id?: string | null;
          patient_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string;
          ocr_text?: string | null;
          extracted?: Json;
          status?: DocumentStatus;
          confidence?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          consultation_id?: string | null;
          patient_id?: string;
          storage_path?: string;
          file_name?: string;
          mime_type?: string;
          ocr_text?: string | null;
          extracted?: Json;
          status?: DocumentStatus;
          confidence?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_consultation_id_fkey";
            columns: ["consultation_id"];
            isOneToOne: false;
            referencedRelation: "consultations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_patient_id_fkey";
            columns: ["patient_id"];
            isOneToOne: false;
            referencedRelation: "patients";
            referencedColumns: ["id"];
          }
        ];
      };
      agent_runs: {
        Row: {
          id: string;
          consultation_id: string | null;
          agent_name: string;
          input: Json;
          output: Json;
          latency_ms: number | null;
          status: string;
          error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          consultation_id?: string | null;
          agent_name: string;
          input?: Json;
          output?: Json;
          latency_ms?: number | null;
          status?: string;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          consultation_id?: string | null;
          agent_name?: string;
          input?: Json;
          output?: Json;
          latency_ms?: number | null;
          status?: string;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "agent_runs_consultation_id_fkey";
            columns: ["consultation_id"];
            isOneToOne: false;
            referencedRelation: "consultations";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_log: {
        Row: {
          id: string;
          actor_id: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id?: string | null;
          action: string;
          entity: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string | null;
          action?: string;
          entity?: string;
          entity_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      safety_rules: {
        Row: {
          id: string;
          name: string;
          keywords_en: string[];
          keywords_hi: string[];
          severity: "urgent" | "attention" | "routine";
          guidance_en: string;
          guidance_hi: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          keywords_en?: string[];
          keywords_hi?: string[];
          severity: "urgent" | "attention" | "routine";
          guidance_en: string;
          guidance_hi: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          keywords_en?: string[];
          keywords_hi?: string[];
          severity?: "urgent" | "attention" | "routine";
          guidance_en?: string;
          guidance_hi?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_doctor: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_patient_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
      get_doctor_id: {
        Args: Record<PropertyKey, never>;
        Returns: string | null;
      };
    };
    Enums: {
      user_role: UserRole;
      consultation_status: ConsultationStatus;
      consultation_urgency: ConsultationUrgency;
      message_role: MessageRole;
      message_input_mode: MessageInputMode;
      document_status: DocumentStatus;
    };
  };
}
