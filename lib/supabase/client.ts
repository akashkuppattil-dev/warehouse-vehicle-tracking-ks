import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'dev-anon-key-placeholder'

  if (
    process.env.NODE_ENV === 'development' &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ) {
    console.warn(
      '[supabase] Missing public env vars in client. Using placeholder values; configure .env.local for full auth features.',
    )
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey,
  )
}
