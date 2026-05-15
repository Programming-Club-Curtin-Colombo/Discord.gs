/**
 * Api.gs
 * Public API for the Discord.gs library.
 */

/**
 * Sends a message to a Discord webhook.
 *
 * @param {string} webhookUrl - The Discord webhook URL.
 * @param {string|Object} options - Either the message content string or an options object.
 * @returns {void}
 */
function send(webhookUrl, options) {
  const messageOptions =
    typeof options === "string" ? { content: options } : options;

  Services.validateOptions(messageOptions);
  return Services.sendDiscordMessage(webhookUrl, messageOptions);
}

/**
 * Sends a message to the announcements channel.
 * Uses the 'announcements' script property for the webhook URL.
 *
 * @param {string|Object} options - Message content or options object.
 */
function sentToAnnouncement(options) {
  return Services.sendByProperty(CONFIG.PROPERTY_KEYS.ANNOUNCEMENTS, options);
}

/**
 * Sends a message to the moderator channel.
 * Uses the 'moderator-text' script property for the webhook URL.
 *
 * @param {string|Object} options - Message content or options object.
 */
function sendToModeratorText(options) {
  return Services.sendByProperty(CONFIG.PROPERTY_KEYS.MODERATOR, options);
}
