import type { PlasmoMessaging } from "@plasmohq/messaging"

import { supabase } from "~lib/supabase"

// Hard-coded user ID for now (as requested)
const CURRENT_USER_ID = "056de3b3-41a5-4755-ae38-26de01c187aa"

async function getSession(tab: any, site: string) {
  const url = new URL(tab.url)

  const cookies = await chrome.cookies.getAll({
    domain: url.hostname
  })
  console.log(cookies)

  let storage = []

  // If tab.id is null (from content script), get the active tab
  if (!tab.id) {
    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
      url: tab.url
    })
    if (activeTab && activeTab.id) {
      storage = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: () => ({
          localStorage: { ...localStorage },
          sessionStorage: { ...sessionStorage }
        })
      })
    }
  } else {
    storage = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        localStorage: { ...localStorage },
        sessionStorage: { ...sessionStorage }
      })
    })
  }

  console.log(storage)

  // Determine cookies_type based on the site parameter
  let cookiesType: "gradescope" | "courseworks" | "miscellaneous"
  if (site === "gradescope") {
    cookiesType = "gradescope"
  } else if (site === "canvas") {
    cookiesType = "courseworks"
  } else {
    cookiesType = "miscellaneous"
  }

  // Prepare the data for upsert
  const sessionData = {
    user_id: CURRENT_USER_ID,
    cookies_type: cookiesType,
    cookies: {
      cookies: cookies,
      localStorage: storage[0]?.result?.localStorage || {},
      sessionStorage: storage[0]?.result?.sessionStorage || {},
      url: tab.url,
      timestamp: new Date().toISOString()
    },
    in_sync: true
  }

  try {
    // First, try to find existing record
    const { data: existingRecord, error: selectError } = await supabase
      .from("user_auth_details")
      .select("id")
      .eq("user_id", CURRENT_USER_ID)
      .eq("cookies_type", cookiesType)
      .maybeSingle()

    if (selectError && selectError.code !== 'PGRST116') {
      console.error("Error checking existing record:", selectError)
      throw selectError
    }

    let result;
    if (existingRecord) {
      // Update existing record
      const { data, error } = await supabase
        .from("user_auth_details")
        .update({
          cookies: sessionData.cookies,
          in_sync: sessionData.in_sync
        })
        .eq("user_id", CURRENT_USER_ID)
        .eq("cookies_type", cookiesType)
        .select()

      if (error) {
        console.error("Error updating session data:", error)
        throw error
      }
      result = data
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from("user_auth_details")
        .insert(sessionData)
        .select()

      if (error) {
        console.error("Error inserting session data:", error)
        throw error
      }
      result = data
    }

    console.log("Session data upserted successfully:", result)
    return result
  } catch (error) {
    console.error("Error in upsert operation:", error)
    throw error
  }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { tab, site } = req.body
    const result = await getSession(tab, site)
    res.send({
      success: true,
      data: result
    })
  } catch (error) {
    console.error("Error in copy-session handler:", error)
    res.send({
      success: false,
      error: error.message
    })
  }
}

export default handler
