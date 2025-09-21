import type { PlasmoMessaging } from "@plasmohq/messaging"

async function getSession(tab) {
  const url = new URL(tab.url)

  const cookies = await chrome.cookies.getAll({
    domain: url.hostname
  })
  console.log(cookies)

  const storage = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => ({
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage }
    })
  })

  console.log(storage)

  
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  await getSession(req.body.tab)
  res.send({
    success: true
  })
}

export default handler
