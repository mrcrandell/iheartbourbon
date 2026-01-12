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
      movies: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          data: Json | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          name: string;
          data?: Json | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          name?: string;
          data?: Json | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
