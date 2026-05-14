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
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(webhookUrl, options);
  const responseCode = response.getResponseCode();

  if (responseCode < 200 || responseCode >= 300) {
    throw new Error(`Discord API error (${responseCode}): ${response.getContentText()}`);
  }

  return response;
}
