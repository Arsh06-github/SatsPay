import { createClient } from '@supabase/supabase-js';

// Supabase configuration for local development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          age: number;
          encrypted_credentials: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          age: number;
          encrypted_credentials?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          age?: number;
          encrypted_credentials?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          type: 'mobile' | 'web' | 'cross-platform';
          is_connected: boolean;
          connection_data: any | null;
          balance: number;
          address: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: 'mobile' | 'web' | 'cross-platform';
          is_connected?: boolean;
          connection_data?: any | null;
          balance?: number;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: 'mobile' | 'web' | 'cross-platform';
          is_connected?: boolean;
          connection_data?: any | null;
          balance?: number;
          address?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          wallet_id: string | null;
          type: 'sent' | 'received';
          amount: number;
          recipient: string | null;
          sender: string | null;
          status: 'pending' | 'completed' | 'failed' | 'autopay';
          tx_hash: string | null;
          autopay_rule_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_id?: string | null;
          type: 'sent' | 'received';
          amount: number;
          recipient?: string | null;
          sender?: string | null;
          status: 'pending' | 'completed' | 'failed' | 'autopay';
          tx_hash?: string | null;
          autopay_rule_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          wallet_id?: string | null;
          type?: 'sent' | 'received';
          amount?: number;
          recipient?: string | null;
          sender?: string | null;
          status?: 'pending' | 'completed' | 'failed' | 'autopay';
          tx_hash?: string | null;
          autopay_rule_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      autopay_rules: {
        Row: {
          id: string;
          user_id: string;
          recipient_wallet_id: string;
          amount: number;
          condition: string;
          is_active: boolean;
          last_triggered: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipient_wallet_id: string;
          amount: number;
          condition: string;
          is_active?: boolean;
          last_triggered?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipient_wallet_id?: string;
          amount?: number;
          condition?: string;
          is_active?: boolean;
          last_triggered?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];