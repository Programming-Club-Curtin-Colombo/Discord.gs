/**
 * Manual test for Discord.gs
 * 
 * Replace WEBHOOK_URL with a real Discord webhook URL to test.
 */
function test_sendSimpleMessage() {
  const WEBHOOK_URL = "YOUR_WEBHOOK_URL_HERE";
  if (WEBHOOK_URL === "YOUR_WEBHOOK_URL_HERE") {
    Logger.log("Please provide a real webhook URL to test.");
    return;
  }
  
  send(WEBHOOK_URL, "Test message from Discord.gs");
}

function test_sendEmbed() {
  const WEBHOOK_URL = "YOUR_WEBHOOK_URL_HERE";
  if (WEBHOOK_URL === "YOUR_WEBHOOK_URL_HERE") {
    Logger.log("Please provide a real webhook URL to test.");
    return;
  }

  const embed = {
    title: "Test Embed",
    description: "This is a test embed from Discord.gs",
    color: Utils_hexToDecimal("#00FF00"),
    footer: {
      text: "Sent via Google Apps Script"
    }
  };
  
  sendEmbed(WEBHOOK_URL, embed, { content: "Header text" });
}

function test_sendAnnouncement() {
  // Ensure the 'announcements' script property is set before running
  try {
    sendAnnouncement("This is a test announcement.");
  } catch (e) {
    Logger.log("Error: " + e.message);
  }
}

function test_sendModeratorMessage() {
  // Ensure the 'moderator-text' script property is set before running
  try {
    sendModeratorMessage("This is a test moderator message.");
  } catch (e) {
    Logger.log("Error: " + e.message);
  }
}
