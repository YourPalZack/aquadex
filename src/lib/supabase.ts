import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types (will be generated from Supabase CLI later)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string | null
          photo_url: string | null
          created_at: string
          updated_at: string
          settings: any | null
        }
        Insert: {
          id?: string
          email: string
          display_name?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
          settings?: any | null
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          photo_url?: string | null
          created_at?: string
          updated_at?: string
          settings?: any | null
        }
      }
      aquariums: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'freshwater' | 'saltwater' | 'brackish'
          volume_gallons: number | null
          setup_date: string | null
          description: string | null
          image_urls: string[] | null
          equipment: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'freshwater' | 'saltwater' | 'brackish'
          volume_gallons?: number | null
          setup_date?: string | null
          description?: string | null
          image_urls?: string[] | null
          equipment?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'freshwater' | 'saltwater' | 'brackish'
          volume_gallons?: number | null
          setup_date?: string | null
          description?: string | null
          image_urls?: string[] | null
          equipment?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      water_tests: {
        Row: {
          id: string
          aquarium_id: string
          user_id: string
          test_date: string
          parameters: any
          notes: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          aquarium_id: string
          user_id: string
          test_date: string
          parameters: any
          notes?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          aquarium_id?: string
          user_id?: string
          test_date?: string
          parameters?: any
          notes?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
      marketplace_listings: {
        Row: {
          id: string
          seller_id: string
          title: string
          description: string
          category: string
          price: number
          currency: string
          condition: 'new' | 'used' | 'refurbished'
          image_urls: string[] | null
          location: any | null
          shipping_options: any | null
          status: 'active' | 'sold' | 'inactive'
          views: number
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title: string
          description: string
          category: string
          price: number
          currency?: string
          condition: 'new' | 'used' | 'refurbished'
          image_urls?: string[] | null
          location?: any | null
          shipping_options?: any | null
          status?: 'active' | 'sold' | 'inactive'
          views?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          title?: string
          description?: string
          category?: string
          price?: number
          currency?: string
          condition?: 'new' | 'used' | 'refurbished'
          image_urls?: string[] | null
          location?: any | null
          shipping_options?: any | null
          status?: 'active' | 'sold' | 'inactive'
          views?: number
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          user_id: string
          category: string
          title: string
          content: string
          tags: string[] | null
          image_urls: string[] | null
          votes: number
          answer_count: number
          is_solved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          title: string
          content: string
          tags?: string[] | null
          image_urls?: string[] | null
          votes?: number
          answer_count?: number
          is_solved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          title?: string
          content?: string
          tags?: string[] | null
          image_urls?: string[] | null
          votes?: number
          answer_count?: number
          is_solved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      answers: {
        Row: {
          id: string
          question_id: string
          user_id: string
          content: string
          votes: number
          is_accepted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_id: string
          user_id: string
          content: string
          votes?: number
          is_accepted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          user_id?: string
          content?: string
          votes?: number
          is_accepted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}