# API Documentation

## Public Methods

### `Api_send(webhookUrl, options)`
The main entry point for sending a message.
- **`webhookUrl`** (string): The Discord webhook URL.
- **`options`** (string | Object): Either the message content as a string, or an options object.
  - `content`: (string) The message text.
  - `username`: (string) Optional username override.
  - `avatar_url`: (string) Optional avatar URL override.
  - `embeds`: (Array<Object>) Optional array of Discord embed objects.

### `Api_sendMessage(webhookUrl, content)`
Sends a simple text message.
- **`webhookUrl`** (string): The Discord webhook URL.
- **`content`** (string): The message text.

### `Api_sendEmbed(webhookUrl, embed, options)`
Sends a single embed.
- **`webhookUrl`** (string): The Discord webhook URL.
- **`embed`** (Object): Discord embed object.
- **`options`** (Object): Additional message options (username, avatar_url, content).

### `Api_sendAnnouncement(options)`
Convenience method to send to the announcements channel.
- Uses the `announcements` Script Property.
- **`options`** (string | Object): Message content or options object.

### `Api_sendModeratorMessage(options)`
Convenience method to send to the moderator channel.
- Uses the `moderator-text` Script Property.
- **`options`** (string | Object): Message content or options object.

---

## Usage Examples

### Simple Message
```javascript
Discord.Api_sendMessage(WEBHOOK_URL, "Hello from Google Apps Script!");
```

### Complex Message with Embed
```javascript
const embed = {
  title: "New Update",
  description: "A new file has been uploaded.",
  color: Discord.Utils_hexToDecimal("#00FF00"),
  fields: [
    { name: "File Name", value: "report.pdf", inline: true },
    { name: "Size", value: "1.2 MB", inline: true }
  ]
};

Discord.Api_send(WEBHOOK_URL, {
  content: "Notification System",
  embeds: [embed]
});
```

### Color Conversion Utility
```javascript
const color = Discord.Utils_hexToDecimal("#7289DA"); // Returns decimal integer
```
