const fs = require("fs");
const path = require("path");
const vm = require("vm");
require("dotenv").config();

/**
 * NODE.JS TEST RUNNER FOR DISCORD.GS
 * This script simulates the Google Apps Script environment to test the library locally.
 */

// 1. Mock Google Apps Script Globals
const context = {
  Logger: {
    log: (msg) => console.log(`[Logger] ${msg}`),
  },
  Utilities: {
    sleep: (ms) => {
      const start = Date.now();
      while (Date.now() - start < ms);
    },
  },
  UrlFetchApp: {
    fetch: (url, options) => {
      console.log(`\n[UrlFetchApp] Sending request to: ${url}`);

      const isMock = url.includes("discord.com/api/webhooks/mock");

      if (!isMock) {
        const fetch = require("sync-fetch");
        const res = fetch(url, {
          method: options.method || "post",
          headers: {
            "Content-Type": options.contentType || "application/json",
          },
          body: options.payload,
        });

        console.log(`[UrlFetchApp] Status: ${res.status}`);

        return {
          getResponseCode: () => res.status,
          getContentText: () => res.text(),
          getAllHeaders: () => {
            // GAS returns a flat object with string values, Node fetch returns arrays
            const headers = {};
            res.headers.forEach((value, name) => {
              headers[name] = value;
            });
            return headers;
          },
        };
      } else {
        console.log(">>> MOCK MODE: Logging payload instead of sending.");
        console.log(`Payload: ${options.payload}`);
        console.log("<<< END MOCK MODE\n");

        return {
          getResponseCode: () => 204,
          getContentText: () => "",
          getAllHeaders: () => ({}),
        };
      }
    },
  },
  PropertiesService: {
    getScriptProperties: () => ({
      getProperty: (key) => {
        const envKey = key.toUpperCase().replace("-", "_") + "_WEBHOOK_URL";
        return process.env[envKey] || null;
      },
    }),
  },
  ContentService: {
    MimeType: { JSON: "application/json" },
    createTextOutput: (content) => ({
      setMimeType: () => content,
    }),
  },
};

// 2. Create Sandbox Environment
vm.createContext(context);

// 3. Load Library Files in Dependency Order
const srcDir = path.join(__dirname, "..");
const files = ["Config.gs", "Utils.gs", "Api.gs", "Services.gs", "Code.gs"];

try {
  files.forEach((file) => {
    const code = fs.readFileSync(path.join(srcDir, file), "utf8");
    vm.runInContext(code, context, { filename: file });
  });
} catch (err) {
  console.error("Error loading library files:", err);
  process.exit(1);
}

// 4. Execution Tests
console.log("=== Discord.gs Node.js Test Suite ===");

const testWebhook =
  process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/mock";

console.log("1. Testing: Api_send(string)");
context.Api_send(testWebhook, "Test message from Node.js environment.");

console.log("2. Testing: Api_sendEmbed()");
context.Api_sendEmbed(testWebhook, {
  title: "Formatting Check",
  description: "This embed is being verified via the Node.js test runner.",
  color: context.Utils_hexToDecimal("#3498db"),
  fields: [{ name: "Environment", value: "Node.js", inline: true }],
  footer: { text: "Discord.gs Local Test" },
});

if (process.env.ANNOUNCEMENTS_WEBHOOK_URL) {
  console.log("3. Testing: Api_sendAnnouncement()");
  context.Api_sendAnnouncement("Property-based webhook test successful.");
}

console.log("=== Test Suite Finished ===");
