import type { PlasmoMessaging } from "@plasmohq/messaging"
import { supabase } from "~lib/supabase"

// Hard-coded user ID for now (as requested)
const CURRENT_USER_ID = "123e4567-e89b-12d3-a456-426614174000"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { site } = req.body
    
    // Determine cookies_type based on the site parameter
    let cookiesType: "gradescope" | "courseworks" | "miscellaneous"
    if (site === "gradescope") {
      cookiesType = "gradescope"
    } else if (site === "canvas") {
      cookiesType = "courseworks"
    } else {
      cookiesType = "miscellaneous"
    }

    // Query the user_auth_details table to check if record exists and in_sync status
    const { data, error } = await supabase
      .from('user_auth_details')
      .select('in_sync')
      .eq('user_id', CURRENT_USER_ID)
      .eq('cookies_type', cookiesType)
      .single()

    if (error) {
      // Record doesn't exist, so user needs to sync
      console.log("No sync record found, user needs to sync")
      res.send({
        success: false,
        inSync: false,
        message: "No sync record found"
      })
      return
    }

    // Check if the record exists and is in sync
    const isInSync = data?.in_sync === true

    res.send({
      success: true,
      inSync: isInSync
    })
  } catch (error) {
    console.error("Error checking sync status:", error)
    res.send({
      success: false,
      inSync: false,
      error: error.message
    })
  }
}

export default handler