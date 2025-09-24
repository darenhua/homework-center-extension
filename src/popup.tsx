import type { Session, User as SupabaseUser } from "@supabase/supabase-js"
import {
  QueryClient,
  QueryClientProvider,
  useMutation
} from "@tanstack/react-query"
import { createContext, useContext, useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"
import { sendToBackground } from "@plasmohq/messaging"

import { CountButton } from "~features/count-button"
import { supabase } from "~lib/supabase"

import "~style.css"

const queryClient = new QueryClient()
const storage = new Storage({ area: "local" })

// Auth context for the extension
interface AuthContextType {
  user: SupabaseUser | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {}
})

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check for stored session first
        const storedSession = await storage.get("supabase_session")
        
        if (storedSession) {
          const { data, error } = await supabase.auth.setSession(storedSession)
          if (!error && data.session) {
            setSession(data.session)
            setUser(data.session.user)
            setLoading(false)
            return
          }
        }

        // Fallback to getting current session
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Auth initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        // Persist session changes
        if (session) {
          await storage.set("supabase_session", session)
        } else {
          await storage.remove("supabase_session")
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    await storage.remove("supabase_session")
    setSession(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Google SVG Icon
function GoogleSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="plasmo-w-5 plasmo-h-5">
      <title>Sign in with Google</title>
      <desc>Google G Logo</desc>
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285f4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34a853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#fbbc05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#ea4335"
      />
    </svg>
  )
}

// Login component
function LoginComponent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Use background script for authentication
      const response = await sendToBackground({
        name: "google-auth",
        body: {}
      })
      
      if (!response.success) {
        setError(response.error || "Authentication failed")
      }
      // If successful, auth state change will update the UI automatically
    } catch (error) {
      console.error("Login failed:", error)
      setError("Failed to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-gap-6 plasmo-p-6 plasmo-w-80">
      <h1 className="plasmo-text-2xl plasmo-font-bold">HomeworkCenter</h1>
      
      {error && (
        <div className="plasmo-text-red-500 plasmo-text-sm plasmo-text-center">
          {error}
        </div>
      )}
      
      <button
        onClick={handleLogin}
        disabled={isLoading}
        aria-label="Sign in with Google"
        className="plasmo-flex plasmo-items-center plasmo-bg-white plasmo-border plasmo-border-gray-300 plasmo-rounded-md plasmo-p-0.5 plasmo-pr-3 hover:plasmo-bg-gray-100 plasmo-transition-colors plasmo-cursor-pointer disabled:plasmo-opacity-50">
        <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-w-9 plasmo-h-9 plasmo-rounded-l">
          <GoogleSvg />
        </div>
        <span className="plasmo-text-sm plasmo-text-gray-700 plasmo-ml-1 plasmo-tracking-wider">
          {isLoading ? "Signing in..." : "Sign in with Google"}
        </span>
      </button>
    </div>
  )
}

// Main popup content
function PopupContent() {
  const { user, signOut, loading } = useAuth()
  const copySessionMutation = useMutation({
    mutationFn: async () => {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      const response = await sendToBackground({
        name: "copy-session",
        body: {
          tab: tab
        }
      })

      return response
    },
    onSuccess: (data) => {
      console.log("Session copied successfully:", data)
    },
    onError: (error) => {
      console.error("Failed to copy session:", error)
    }
  })

  // Show loading state
  if (loading) {
    return (
      <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-p-4 plasmo-w-64">
        <div className="plasmo-text-gray-500">Loading...</div>
      </div>
    )
  }

  // If not logged in, show login component
  if (!user) {
    return <LoginComponent />
  }

  // If logged in, show the main popup content
  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-p-4 plasmo-w-64">
      <div className="plasmo-text-sm plasmo-text-gray-600 plasmo-mb-2">
        {user.email}
      </div>
      <CountButton />
      <button
        onClick={() => copySessionMutation.mutate()}
        disabled={copySessionMutation.isPending}
        className="plasmo-mt-4 plasmo-px-4 plasmo-py-2 plasmo-bg-blue-500 plasmo-text-white plasmo-rounded plasmo-font-medium hover:plasmo-bg-blue-600 disabled:plasmo-opacity-50">
        {copySessionMutation.isPending ? "Copying..." : "Copy Session"}
      </button>
      <button
        onClick={signOut}
        className="plasmo-mt-2 plasmo-px-4 plasmo-py-2 plasmo-bg-gray-200 plasmo-text-gray-700 plasmo-rounded plasmo-font-medium hover:plasmo-bg-gray-300">
        Sign Out
      </button>
    </div>
  )
}

function IndexPopup() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PopupContent />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default IndexPopup
