import sonnerStyles from "data-text:~sonner.css"
import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { Toaster } from "sonner"

import { sendToBackground } from "@plasmohq/messaging"

import {
  customToast,
  errorToast,
  successToast
} from "~components/ui/custom-toast"

export const config: PlasmoCSConfig = {
  matches: [
    "https://www.gradescope.com/*",
    "https://courseworks2.columbia.edu/*"
  ],
  css: ["font.css"]
}

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = [cssText].join("\n")
  return style
}

const SessionSync = () => {
  const [isSyncing, setIsSyncing] = useState(false)
  const [shouldShowToast, setShouldShowToast] = useState(false)

  useEffect(() => {
    const checkSyncStatus = async () => {
      try {
        // Determine the site name based on the hostname
        const hostname = window.location.hostname
        const siteName = hostname.includes("gradescope")
          ? "Gradescope"
          : "Canvas"
        const siteKey =
          siteName.toLowerCase() === "gradescope" ? "gradescope" : "canvas"

        // Check the in_sync status from Supabase
        const response = await sendToBackground({
          name: "check-sync-status",
          body: {
            site: siteKey
          }
        })

        // Only show toast if in_sync is false or record doesn't exist
        if (!response.success || !response.inSync) {
          setShouldShowToast(true)
          // Show the toast with the button after checking status
          setTimeout(() => {
            customToast({
              title: `Sync ${siteName} Session`,
              description: `Keep your ${siteName} session in sync with HomeworkCenter for seamless access across devices.`,
              button: {
                label: `Sync ${siteName}`,
                onClick: async () => {
                  handleSyncSession(siteKey)
                }
              }
            })
          }, 500)
        }
      } catch (error) {
        console.error("Error checking sync status:", error)
        // If error checking status, show toast anyway
        setShouldShowToast(true)
      }
    }

    checkSyncStatus()
  }, [])

  const handleSyncSession = async (site: string) => {
    setIsSyncing(true)

    try {
      // Get current tab info directly from window.location
      const tabInfo = {
        url: window.location.href,
        id: null // Will be handled in background script
      }

      const response = await sendToBackground({
        name: "copy-session",
        body: {
          tab: tabInfo,
          site: site // "gradescope" or "canvas"
        }
      })

      if (response.success) {
        successToast(
          `${site.charAt(0).toUpperCase() + site.slice(1)} session synced successfully!`
        )
      } else {
        errorToast(`Failed to sync ${site} session`)
      }
    } catch (error) {
      console.error("Error syncing session:", error)
      errorToast(`Error syncing session: ${error.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div 
      style={{ 
        position: "fixed", 
        top: "16px", 
        right: "16px", 
        zIndex: 999999999,
        pointerEvents: "none" // Allows clicks through when no toasts are visible
      }}
    >
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="light"
        offset={0} // Remove default offset since we're positioning manually
        toastOptions={{
          style: {
            background: "white",
            color: "#333",
            border: "1px solid #e5e7eb",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
            borderRadius: "12px",
            pointerEvents: "auto", // Re-enable pointer events for the actual toasts
            fontFamily: "var(--font-asul, Asul, system-ui, sans-serif)"
          }
        }}
      />
    </div>
  )
}

export default SessionSync
