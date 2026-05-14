// ============================================================
// Vela — Database Types (matches Supabase schema exactly)
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // ---- profiles ----
      profiles: {
        Row: {
          id: string; // uuid references auth.users
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          safe_word: string | null; // palabra clave para bot WhatsApp
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          safe_word?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          safe_word?: string | null;
          updated_at?: string;
        };
      };

      // ---- emergency_contacts ----
      emergency_contacts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          relation: string;
          phone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          relation: string;
          phone: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          relation?: string;
          phone?: string;
        };
      };

      // ---- sessions (salidas) ----
      sessions: {
        Row: {
          id: string;
          code: string; // 6-char join code
          name: string;
          venue: string | null;
          host_id: string;
          status: "lobby" | "active" | "ended";
          started_at: string | null;
          ended_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code?: string;
          name: string;
          venue?: string | null;
          host_id: string;
          status?: "lobby" | "active" | "ended";
          started_at?: string | null;
          ended_at?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          venue?: string | null;
          status?: "lobby" | "active" | "ended";
          started_at?: string | null;
          ended_at?: string | null;
        };
      };

      // ---- session_members ----
      session_members: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          status: "lobby" | "ready" | "active" | "bathroom" | "taxi" | "ended";
          last_seen_at: string | null;
          lat: number | null;
          lng: number | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          status?: "lobby" | "ready" | "active" | "bathroom" | "taxi" | "ended";
          last_seen_at?: string | null;
          lat?: number | null;
          lng?: number | null;
          joined_at?: string;
        };
        Update: {
          status?: "lobby" | "ready" | "active" | "bathroom" | "taxi" | "ended";
          last_seen_at?: string | null;
          lat?: number | null;
          lng?: number | null;
        };
      };

      // ---- panic_alerts ----
      panic_alerts: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          lat: number | null;
          lng: number | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          lat?: number | null;
          lng?: number | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          resolved_at?: string | null;
        };
      };

      // ---- taxi_registrations ----
      taxi_registrations: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          plate: string;
          app: "Uber" | "InDrive" | "Cabify" | "Taxi normal";
          destination: string;
          destination_lat: number | null;
          destination_lng: number | null;
          eta_minutes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          plate: string;
          app: "Uber" | "InDrive" | "Cabify" | "Taxi normal";
          destination: string;
          destination_lat?: number | null;
          destination_lng?: number | null;
          eta_minutes: number;
          created_at?: string;
        };
        Update: {
          plate?: string;
          app?: "Uber" | "InDrive" | "Cabify" | "Taxi normal";
          destination?: string;
          destination_lat?: number | null;
          destination_lng?: number | null;
          eta_minutes?: number;
        };
      };

      // ---- bathroom_timers ----
      bathroom_timers: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          duration_minutes: number;
          expires_at: string;
          returned_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          duration_minutes: number;
          expires_at: string;
          returned_at?: string | null;
          created_at?: string;
        };
        Update: {
          returned_at?: string | null;
        };
      };

      // ---- saved_destinations ----
      saved_destinations: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          lat: number | null;
          lng: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          lat?: number | null;
          lng?: number | null;
        };
      };
    };
    Views: {};
    Functions: {
      generate_session_code: {
        Args: {};
        Returns: string;
      };
    };
    Enums: {};
  };
}

// ============================================================
// Convenience types
// ============================================================
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type EmergencyContact =
  Database["public"]["Tables"]["emergency_contacts"]["Row"];
export type Session = Database["public"]["Tables"]["sessions"]["Row"];
export type SessionMember =
  Database["public"]["Tables"]["session_members"]["Row"];
export type PanicAlert = Database["public"]["Tables"]["panic_alerts"]["Row"];
export type TaxiRegistration =
  Database["public"]["Tables"]["taxi_registrations"]["Row"];
export type BathroomTimer =
  Database["public"]["Tables"]["bathroom_timers"]["Row"];

// Extended member with profile joined
export type SessionMemberWithProfile = SessionMember & {
  profiles: Pick<Profile, "full_name" | "avatar_url" | "phone">;
};
