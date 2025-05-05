import { createClient } from '@supabase/supabase-js'

// These would normally come from environment variables
// For this demo, we're using placeholders
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-public-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { data, error }
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data?.user
}

export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('likes, bookmarks')
    .eq('user_id', userId)
    .single()

  return { data, error }
}

export async function toggleLike(userId: string, itemId: string) {
  // First get current likes
  const { data: preferences } = await getUserPreferences(userId)

  const likes = preferences?.likes || []
  const isLiked = likes.includes(itemId)

  const newLikes = isLiked ? likes.filter((id: string) => id !== itemId) : [...likes, itemId]

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      likes: newLikes,
    })
    .select()

  return { data, error, isLiked: !isLiked }
}

export async function toggleBookmark(userId: string, itemId: string) {
  // First get current bookmarks
  const { data: preferences } = await getUserPreferences(userId)

  const bookmarks = preferences?.bookmarks || []
  const isBookmarked = bookmarks.includes(itemId)

  const newBookmarks = isBookmarked
    ? bookmarks.filter((id: string) => id !== itemId)
    : [...bookmarks, itemId]

  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      bookmarks: newBookmarks,
    })
    .select()

  return { data, error, isBookmarked: !isBookmarked }
}
