/**
 * Sends a message to Discord.
 * 
 * @param {string} webhookUrl - The Discord webhook URL.
 * @param {Object} messageOptions - The message options (content, embeds, username, avatar_url).
 * @returns {void}
 */
function Services_sendDiscordMessage(webhookUrl, messageOptions) {
  const payload = {
    username: messageOptions.username || CONFIG.DEFAULT_USERNAME,
    avatar_url: messageOptions.avatar_url || CONFIG.DEFAULT_AVATAR_URL,
    content: messageOptions.content || "",
    embeds: messageOptions.embeds || []
  };

  Api_postToDiscord(webhookUrl, payload);
}

/**
 * Validates the message payload before sending.
 * 
 * @param {Object} options - The options to validate.
 * @throws {Error} If the options are invalid.
 */
function Services_validateOptions(options) {
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
function Services_sendByProperty(propertyKey, options) {
  const webhookUrl = PropertiesService.getScriptProperties().getProperty(propertyKey);
  
  if (!webhookUrl) {
    throw new Error(`Webhook URL not found in script property: ${propertyKey}`);
  }

  let messageOptions = typeof options === "string" ? { content: options } : options;
  Services_validateOptions(messageOptions);
  return Services_sendDiscordMessage(webhookUrl, messageOptions);
}
