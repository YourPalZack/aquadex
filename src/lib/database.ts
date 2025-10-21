import { supabase } from './supabase'
import type { Database } from './supabase'

type Tables = Database['public']['Tables']
type User = Tables['users']['Row']
type Aquarium = Tables['aquariums']['Row']
type WaterTest = Tables['water_tests']['Row']
type MarketplaceListing = Tables['marketplace_listings']['Row']
type Question = Tables['questions']['Row']
type Answer = Tables['answers']['Row']

// User operations
export const createUserProfile = async (userData: Tables['users']['Insert']) => {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No rows found
    throw error
  }
  return data
}

export const updateUserProfile = async (userId: string, updates: Tables['users']['Update']) => {
  const { data, error } = await supabase
    .from('users')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Aquarium operations
export const createAquarium = async (aquariumData: Tables['aquariums']['Insert']) => {
  const { data, error } = await supabase
    .from('aquariums')
    .insert(aquariumData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getUserAquariums = async (userId: string): Promise<Aquarium[]> => {
  const { data, error } = await supabase
    .from('aquariums')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export const getAquarium = async (aquariumId: string): Promise<Aquarium | null> => {
  const { data, error } = await supabase
    .from('aquariums')
    .select('*')
    .eq('id', aquariumId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export const updateAquarium = async (aquariumId: string, updates: Tables['aquariums']['Update']) => {
  const { data, error } = await supabase
    .from('aquariums')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', aquariumId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteAquarium = async (aquariumId: string) => {
  const { error } = await supabase
    .from('aquariums')
    .delete()
    .eq('id', aquariumId)

  if (error) throw error
}

// Water test operations
export const createWaterTest = async (testData: Tables['water_tests']['Insert']) => {
  const { data, error } = await supabase
    .from('water_tests')
    .insert(testData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getAquariumWaterTests = async (aquariumId: string, limit?: number): Promise<WaterTest[]> => {
  let query = supabase
    .from('water_tests')
    .select('*')
    .eq('aquarium_id', aquariumId)
    .order('test_date', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export const getUserWaterTests = async (userId: string, limit?: number): Promise<WaterTest[]> => {
  let query = supabase
    .from('water_tests')
    .select(`
      *,
      aquariums!inner(
        id,
        name,
        type
      )
    `)
    .eq('user_id', userId)
    .order('test_date', { ascending: false })

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export const getWaterTest = async (testId: string): Promise<WaterTest | null> => {
  const { data, error } = await supabase
    .from('water_tests')
    .select(`
      *,
      aquariums!inner(
        id,
        name,
        type,
        user_id
      )
    `)
    .eq('id', testId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export const updateWaterTest = async (testId: string, updates: Tables['water_tests']['Update']) => {
  const { data, error } = await supabase
    .from('water_tests')
    .update(updates)
    .eq('id', testId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteWaterTest = async (testId: string) => {
  const { error } = await supabase
    .from('water_tests')
    .delete()
    .eq('id', testId)

  if (error) throw error
}

// Marketplace operations
export const createMarketplaceListing = async (listingData: Tables['marketplace_listings']['Insert']) => {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .insert(listingData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getMarketplaceListings = async (
  category?: string,
  limit?: number,
  offset?: number
): Promise<MarketplaceListing[]> => {
  let query = supabase
    .from('marketplace_listings')
    .select(`
      *,
      users!marketplace_listings_seller_id_fkey(
        id,
        display_name,
        photo_url
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  if (limit) {
    query = query.limit(limit)
  }

  if (offset) {
    query = query.range(offset, offset + (limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export const getMarketplaceListing = async (listingId: string): Promise<MarketplaceListing | null> => {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select(`
      *,
      users!marketplace_listings_seller_id_fkey(
        id,
        display_name,
        photo_url
      )
    `)
    .eq('id', listingId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export const getUserListings = async (userId: string): Promise<MarketplaceListing[]> => {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Q&A operations
export const createQuestion = async (questionData: Tables['questions']['Insert']) => {
  const { data, error } = await supabase
    .from('questions')
    .insert(questionData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getQuestions = async (
  category?: string,
  limit?: number,
  offset?: number
): Promise<Question[]> => {
  let query = supabase
    .from('questions')
    .select(`
      *,
      users!questions_user_id_fkey(
        id,
        display_name,
        photo_url
      )
    `)
    .order('created_at', { ascending: false })

  if (category) {
    query = query.eq('category', category)
  }

  if (limit) {
    query = query.limit(limit)
  }

  if (offset) {
    query = query.range(offset, offset + (limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export const getQuestion = async (questionId: string): Promise<Question | null> => {
  const { data, error } = await supabase
    .from('questions')
    .select(`
      *,
      users!questions_user_id_fkey(
        id,
        display_name,
        photo_url
      )
    `)
    .eq('id', questionId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export const createAnswer = async (answerData: Tables['answers']['Insert']) => {
  const { data, error } = await supabase
    .from('answers')
    .insert(answerData)
    .select()
    .single()

  if (error) throw error
  return data
}

export const getQuestionAnswers = async (questionId: string): Promise<Answer[]> => {
  const { data, error } = await supabase
    .from('answers')
    .select(`
      *,
      users!answers_user_id_fkey(
        id,
        display_name,
        photo_url
      )
    `)
    .eq('question_id', questionId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Real-time subscriptions
export const subscribeToAquariumTests = (aquariumId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`aquarium-${aquariumId}-tests`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'water_tests',
        filter: `aquarium_id=eq.${aquariumId}`
      },
      callback
    )
    .subscribe()
}

export const subscribeToUserAquariums = (userId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`user-${userId}-aquariums`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'aquariums',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe()
}