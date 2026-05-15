/**
 * Services.gs
 * Core business logic for Discord webhook interactions.
 */
const Services = (() => {
  /**
   * Posts a payload to a Discord webhook with retry logic and rate limit handling.
   *
   * @param {string} webhookUrl - The Discord webhook URL.
   * @param {Object} payload - The JSON payload or multipart payload.
   * @param {boolean} [isMultipart=false] - Whether the payload is multipart.
   * @returns {GoogleAppsScript.URL_Fetch.HTTPResponse}
   * @private
   */
  function postToDiscord(webhookUrl, payload, isMultipart = false) {
    if (!webhookUrl) {
      throw new Error("Discord webhook URL is required.");
    }

    const options = {
      method: "post",
      muteHttpExceptions: true,
      payload: isMultipart ? payload : JSON.stringify(payload),
    };

    if (!isMultipart) {
      options.contentType = "application/json";
    }

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
        let waitTimeMs = 1000;

        try {
          const responseData = JSON.parse(responseText);
          waitTimeMs = (responseData.retry_after || 1) * 1000;
        } catch (e) {
          const headers = response.getAllHeaders();
          const retryAfter = headers["Retry-After"] || headers["retry-after"];
          if (retryAfter) {
            waitTimeMs = parseInt(retryAfter) * 1000;
          }
        }

        Logger.log(
          `Discord Rate Limited (429). Attempt ${attempt + 1}/${CONFIG.MAX_RETRIES}. Waiting ${waitTimeMs}ms...`,
        );

        if (waitTimeMs > 300000) {
          throw new Error(
            `Discord rate limit wait time (${waitTimeMs}ms) exceeds GAS limits.`,
          );
        }

        Utilities.sleep(waitTimeMs);
        continue;
      }

      throw new Error(
        `Discord API error (${responseCode}): ${response.getContentText()}`,
      );
    }

    throw new Error(
      `Failed after ${CONFIG.MAX_RETRIES} attempts due to rate limiting.`,
    );
  }

  /**
   * Sends a message to Discord.
   *
   * @param {string} webhookUrl - The Discord webhook URL.
   * @param {Object} messageOptions - The message options (content, embeds, username, avatar_url, files).
   * @returns {void}
   */
  function sendDiscordMessage(webhookUrl, messageOptions) {
    const jsonData = {
      username: messageOptions.username || CONFIG.DEFAULT_USERNAME,
      avatar_url: messageOptions.avatar_url || CONFIG.DEFAULT_AVATAR_URL,
      content: messageOptions.content || "",
      embeds: messageOptions.embeds || [],
    };

    // Handle files (attachments)
    if (messageOptions.files && messageOptions.files.length > 0) {
      const payload = {
        payload_json: JSON.stringify(jsonData),
      };

      messageOptions.files.forEach((file, index) => {
        // file can be a Blob, or an object { name, content, type }
        if (file.getBlob) {
          payload[`file[${index}]`] = file.getBlob();
        } else if (typeof file === "string" || file.slice) {
          // Assume it's a blob-like thing or string
          payload[`file[${index}]`] = file;
        } else {
          // Object structure { content, name, type }
          const blob = Utilities.newBlob(file.content, file.type, file.name);
          payload[`file[${index}]`] = blob;
        }
      });

      return postToDiscord(webhookUrl, payload, true);
    }

    return postToDiscord(webhookUrl, jsonData, false);
  }

  /**
   * Validates the message payload before sending.
   *
   * @param {Object} options - The options to validate.
   * @throws {Error} If the options are invalid.
   */
  function validateOptions(options) {
    if (!options) {
      throw new Error("Message options are required.");
    }

    if (!options.content && (!options.embeds || options.embeds.length === 0)) {
      throw new Error("Discord message must have either content or embeds.");
    }
  }

  /**
   * Sends a message using a webhook URL stored in script properties.
   *
   * @param {string} propertyKey - The key of the script property holding the webhook URL.
   * @param {string|Object} options - Message content or options object.
   */
  function sendByProperty(propertyKey, options) {
    const webhookUrl =
      PropertiesService.getScriptProperties().getProperty(propertyKey);

    if (!webhookUrl) {
      throw new Error(
        `Webhook URL not found in script property: ${propertyKey}`,
      );
    }

    const messageOptions =
      typeof options === "string" ? { content: options } : options;
    validateOptions(messageOptions);
    return sendDiscordMessage(webhookUrl, messageOptions);
  }

  return Object.freeze({
    sendDiscordMessage,
    validateOptions,
    sendByProperty,
  });
})();
