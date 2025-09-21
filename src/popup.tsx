import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CountButton } from "~features/count-button"
import { sendToBackground } from "@plasmohq/messaging"
import { useMutation } from "@tanstack/react-query"

import "~style.css"

const queryClient = new QueryClient()

function PopupContent() {
  const copySessionMutation = useMutation({
    mutationFn: async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
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

  return (
    <div className="plasmo-flex plasmo-flex-col plasmo-items-center plasmo-justify-center plasmo-p-4 plasmo-w-64">
      <CountButton />
      <button
        onClick={() => copySessionMutation.mutate()}
        disabled={copySessionMutation.isPending}
        className="plasmo-mt-4 plasmo-px-4 plasmo-py-2 plasmo-bg-blue-500 plasmo-text-white plasmo-rounded plasmo-font-medium hover:plasmo-bg-blue-600 disabled:plasmo-opacity-50"
      >
        {copySessionMutation.isPending ? "Copying..." : "Copy Session"}
      </button>
    </div>
  )
}

function IndexPopup() {
  return (
    <QueryClientProvider client={queryClient}>
      <PopupContent />
    </QueryClientProvider>
  )
}

export default IndexPopup
