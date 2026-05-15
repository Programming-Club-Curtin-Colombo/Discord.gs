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

      // GAS has a limit on Utilities.sleep (usually 300,000ms / 5 mins)
      if (waitTimeMs > 300000) {
        throw new Error(
          `Discord rate limit wait time (${waitTimeMs}ms) exceeds Google Apps Script limits. Please try again later.`,
        );
      }

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

/**
 * Sends a message to Discord.
 *
 * @param {string} webhookUrl - The Discord webhook URL.
 * @param {string|Object} options - Either the message content string or an options object.
 * @returns {void}
 */
function Api_send(webhookUrl, options) {
  const messageOptions =
    typeof options === "string" ? { content: options } : options;

  Services.validateOptions(messageOptions);
  return Services.sendDiscordMessage(webhookUrl, messageOptions);
}

/**
 * Sends a simple text message to Discord.
 *
 * @param {string} webhookUrl - The Discord webhook URL.
 * @param {string} content - The message content.
 * @returns {void}
 */
function Api_sendMessage(webhookUrl, content) {
  return Api_send(webhookUrl, { content: content });
}

/**
 * Sends an embed to Discord.
 *
 * @param {string} webhookUrl - The Discord webhook URL.
 * @param {Object} embed - The Discord embed object.
 * @param {Object} [options] - Additional message options (username, avatar_url, content).
 * @returns {void}
 */
function Api_sendEmbed(webhookUrl, embed, options = {}) {
  const messageOptions = {
    ...options,
    embeds: [embed],
  };
  return Api_send(webhookUrl, messageOptions);
}

/**
 * Sends a message to the announcements channel.
 * Uses the 'announcements' script property for the webhook URL.
 *
 * @param {string|Object} options - Message content or options object.
 */
function Api_sendAnnouncement(options) {
  return Services.sendByProperty(CONFIG.PROPERTY_KEYS.ANNOUNCEMENTS, options);
}

/**
 * Sends a message to the moderator channel.
 * Uses the 'moderator-text' script property for the webhook URL.
 *
 * @param {string|Object} options - Message content or options object.
 */
function Api_sendModeratorMessage(options) {
  return Services.sendByProperty(CONFIG.PROPERTY_KEYS.MODERATOR, options);
}
