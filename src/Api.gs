/**
 * Posts a payload to a Discord webhook.
 *
 * @param {string} webhookUrl - The Discord webhook URL.
 * @param {Object} payload - The JSON payload to send.
 * @returns {GoogleAppsScript.URL_Fetch.HTTPResponse} The response from Discord.
 * @throws {Error} If the API call fails.
 */
function Api_postToDiscord(webhookUrl, payload) {
  if (!webhookUrl) {
    throw new Error("Discord webhook URL is required.");
  }

  const options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  for (let attempt = 0; attempt < CONFIG.MAX_RETRIES; attempt++) {
    const response = UrlFetchApp.fetch(webhookUrl, options);
    const responseCode = response.getResponseCode();

    // Success
    if (responseCode >= 200 && responseCode < 300) {
      return response;
    }

    // Rate Limited
    if (responseCode === 429) {
      const responseText = response.getContentText();
      let waitTimeMs = 1000; // Default 1s

      try {
        const responseData = JSON.parse(responseText);
        // Discord retry_after is in seconds
        waitTimeMs = (responseData.retry_after || 1) * 1000;
      } catch (e) {
        // Fallback to header if JSON parsing fails
        const retryAfterHeader = response.getAllHeaders()["Retry-After"];
        if (retryAfterHeader) {
          waitTimeMs = parseInt(retryAfterHeader) * 1000;
        }
      }

      Logger.log(
        `Discord Rate Limited (429). Attempt ${attempt + 1}/${CONFIG.MAX_RETRIES}. Waiting ${waitTimeMs}ms...`,
      );
      Utilities.sleep(waitTimeMs);
      continue;
    }

    // Other errors
    throw new Error(
      `Discord API error (${responseCode}): ${response.getContentText()}`,
    );
  }

  throw new Error(
    `Failed to send message to Discord after ${CONFIG.MAX_RETRIES} attempts due to rate limiting.`,
  );
}
