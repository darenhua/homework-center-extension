import { CountButton } from "~features/count-button"
import { sendToBackground } from "@plasmohq/messaging"
 

import "~style.css"

function test() {
  // Extension's content script
  const resp = await sendToBackground({
    name: "ping",
    body: {
      id: 123
    }
  })
  
  return null
}

function IndexPopup() {
  return (
    <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-16 plasmo-w-40">
      <CountButton />
    </div>
  )
}

export default IndexPopup
