import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"
import { supabase } from "~lib/supabase"

const storage = new Storage({ area: "local" })

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    // Use new tab for better UX (popup won't close)
    const { data } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: chrome.identity.getRedirectURL(),
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })

    if (data.url) {
      // Create new tab for authentication
      const authTab = await chrome.tabs.create({ 
        url: data.url,
        active: true 
      })

      // Listen for redirect
      const authResult = await new Promise((resolve, reject) => {
        const listener = async (tabId: number, changeInfo: any, tab: any) => {
          if (tabId === authTab.id && tab.url?.includes(chrome.identity.getRedirectURL())) {
            try {
              // Parse the URL for tokens
              const url = new URL(tab.url)
              const hashParams = new URLSearchParams(url.hash.substring(1))
              const searchParams = url.searchParams

              // Check both hash and search params (different OAuth flows)
              const accessToken = hashParams.get("access_token") || searchParams.get("access_token")
              const refreshToken = hashParams.get("refresh_token") || searchParams.get("refresh_token")

              if (accessToken && refreshToken) {
                // Set the session in Supabase
                const { data: sessionData, error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken
                })

                // Close the auth tab
                chrome.tabs.remove(authTab.id)
                chrome.tabs.onUpdated.removeListener(listener)

                if (error) {
                  reject(error)
                } else {
                  // Store session in chrome storage
                  await storage.set("supabase_session", sessionData.session)
                  resolve({ success: true, session: sessionData.session })
                }
              }
            } catch (error) {
              chrome.tabs.remove(authTab.id)
              chrome.tabs.onUpdated.removeListener(listener)
              reject(error)
            }
          }
        }

        chrome.tabs.onUpdated.addListener(listener)

        // Timeout after 5 minutes
        setTimeout(() => {
          chrome.tabs.onUpdated.removeListener(listener)
          reject(new Error("Authentication timeout"))
        }, 300000)
      })

      res.send(authResult)
    } else {
      throw new Error("Failed to get OAuth URL")
    }
  } catch (error) {
    console.error("Auth error:", error)
    res.send({ 
      success: false, 
      error: error.message || "Authentication failed" 
    })
  }
}

export default handler