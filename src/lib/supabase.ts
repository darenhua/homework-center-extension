import { createClient } from "@supabase/supabase-js"
import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "local" })

const supabaseStorage = {
  async getItem(key: string): Promise<string | null> {
    const value = await storage.get(key)
    return value || null
  },
  async setItem(key: string, value: string): Promise<void> {
    await storage.set(key, value)
  },
  async removeItem(key: string): Promise<void> {
    await storage.remove(key)
  }
}

export const supabase = createClient(
  process.env.PLASMO_PUBLIC_SUPABASE_URL || "",
  process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY || "",
  {
    auth: {
      storage: supabaseStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

export function getRedirectURL() {
  return chrome.identity.getRedirectURL("oauth2")
}