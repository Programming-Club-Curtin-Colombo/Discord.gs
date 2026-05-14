/**
 * Sends a message to Discord.
 * 
 * @param {string} webhookUrl - The Discord webhook URL.
 * @param {string|Object} options - Either the message content string or an options object.
 * @returns {void}
 */
function send(webhookUrl, options) {
  const messageOptions = typeof options === "string" ? { content: options } : options;

  Services_validateOptions(messageOptions);
  return Services_sendDiscordMessage(webhookUrl, messageOptions);
}

/**
 * Sends a simple text message to Discord.
 * 
 * @param {string} webhookUrl - The Discord webhook URL.
 * @param {string} content - The message content.
 * @returns {void}
 */
function sendMessage(webhookUrl, content) {
  return send(webhookUrl, { content: content });
}

/**
 * Sends an embed to Discord.
 * 
 * @param {string} webhookUrl - The Discord webhook URL.
 * @param {Object} embed - The Discord embed object.
 * @param {Object} [options] - Additional message options (username, avatar_url, content).
 * @returns {void}
 */
function sendEmbed(webhookUrl, embed, options = {}) {
  const messageOptions = {
    ...options,
    embeds: [embed]
  };
  return send(webhookUrl, messageOptions);
}

/**
 * Sends a message to the announcements channel.
 * Uses the 'announcements' script property for the webhook URL.
 * 
 * @param {string|Object} options - Message content or options object.
 */
function sendAnnouncement(options) {
  return Services_sendByProperty(CONFIG.PROPERTY_KEYS.ANNOUNCEMENTS, options);
}

/**
 * Sends a message to the moderator channel.
 * Uses the 'moderator-text' script property for the webhook URL.
 * 
 * @param {string|Object} options - Message content or options object.
 */
function sendModeratorMessage(options) {
  return Services_sendByProperty(CONFIG.PROPERTY_KEYS.MODERATOR, options);
}
