const fs = require("fs");
const path = require("path");
const vm = require("vm");
require("dotenv").config();

/**
 * NODE.JS TEST SUITE FOR DISCORD.GS
 * This script simulates the Google Apps Script environment to test the library locally.
 */

// 1. Mock Google Apps Script Globals
const context = {
  Logger: {
    log: (msg) => console.log(`[Logger] ${msg}`),
  },
  Utilities: {
    sleep: (ms) => {
      console.log(`[Utilities.sleep] Sleeping for ${ms}ms...`);
      const start = Date.now();
      while (Date.now() - start < ms);
    },
    newBlob: (data, type, name) => ({
      getDataAsString: () => data.toString(),
      getContentType: () => type,
      getName: () => name,
      getBlob: function () {
        return this;
      },
    }),
  },
  UrlFetchApp: {
    fetch: (url, options = {}) => {
      console.log(`\n[UrlFetchApp] Request to: ${url}`);
      const fetch = require("sync-fetch");

      const fetchOptions = {
        method: options.method || "get",
        headers: {},
      };

      if (options.payload) {
        if (typeof options.payload === "object" && !options.contentType) {
          // Simulate multipart/form-data
          const boundary = "GASMOCKBOUNDARY" + Date.now();
          fetchOptions.headers["Content-Type"] =
            `multipart/form-data; boundary=${boundary}`;

          // Construct a simple multipart body for testing purposes
          let body = "";
          for (const key in options.payload) {
            body += `--${boundary}\r\n`;
            body += `Content-Disposition: form-data; name="${key}"`;
            const val = options.payload[key];
            if (val.getName) {
              body += `; filename="${val.getName()}"\r\n`;
              body += `Content-Type: ${val.getContentType() || "application/octet-stream"}\r\n\r\n`;
              body += (val.getDataAsString ? val.getDataAsString() : val) + "\r\n";
            } else {
              body += `\r\n\r\n`;
              body += val + "\r\n";
            }
          }
          body += `--${boundary}--\r\n`;
          fetchOptions.body = body;
        } else {
          fetchOptions.headers["Content-Type"] =
            options.contentType || "application/json";
          fetchOptions.body = options.payload;
        }
      }

      const res = fetch(url, fetchOptions);
      console.log(`[UrlFetchApp] Status: ${res.status}`);

      return {
        getResponseCode: () => res.status,
        getContentText: () => res.text(),
        getBlob: () => {
          const buffer = res.buffer();
          return {
            getContentType: () => res.headers.get("content-type"),
            setName: (name) => {
              this.name = name;
            },
            getName: () => this.name || "downloaded_file",
            getBlob: function () {
              return this;
            },
          };
        },
        getAllHeaders: () => {
          const headers = {};
          res.headers.forEach((value, name) => {
            headers[name] = value;
          });
          return headers;
        },
      };
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
  console: console,
};

// 2. Create Sandbox Environment
vm.createContext(context);

// 3. Load Library Files
const srcDir = path.join(__dirname, "..");
const files = ["Config.gs", "Utils.gs", "Api.gs", "Services.gs"];

try {
  files.forEach((file) => {
    const code = fs.readFileSync(path.join(srcDir, file), "utf8");
    vm.runInContext(code, context, { filename: file });
  });
} catch (err) {
  console.error("Error loading library files:", err);
  process.exit(1);
}

// 4. Execution Suite (Mirrors GasTests.gs)
console.log("=== Discord.gs Local Node.js Test Suite ===");

context.testWebhook =
  process.env.DISCORD_WEBHOOK_URL || "https://discord.com/api/webhooks/mock";
context.process = { env: process.env };

vm.runInContext(
  `
  function runTest(name, options) {
    console.log("\\n>>> [SCENARIO] " + name);
    try {
      send(testWebhook, options);
      console.log(">>> SUCCESS");
    } catch (e) {
      console.error(">>> FAILED: " + e.message);
    }
  }

  // 1. Normal Message
  runTest("Normal Message", "Hello from Node.js tests!");

  // 2. Message with attachment image
  const imageBlob = UrlFetchApp.fetch("https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png").getBlob();
  runTest("Message with Image", {
    content: "Node test with image",
    files: [imageBlob]
  });

  // 3. Attachment with txt
  const textBlob = Utilities.newBlob("Node.js Test Content", "text/plain", "node.txt");
  runTest("Message with Text File", {
    content: "Node test with text file",
    files: [textBlob]
  });

  // 4. Message with one embed
  runTest("Message with One Embed", {
    content: "Here is an embed:",
    embeds: [{
      title: "Node Embed",
      description: "Testing single embed",
      color: Utils.getRandomColor()
    }]
  });

  // 5. Embed alone
  runTest("Embed Alone", {
    embeds: [{
      title: "Lone Embed",
      description: "No content string here.",
      color: Utils.getRandomColor()
    }]
  });

  // 6. Two embeds
  runTest("Two Embeds", {
    embeds: [
      { title: "One", color: Utils.getRandomColor() },
      { title: "Two", color: Utils.getRandomColor() }
    ]
  });

  // 7. Embed with attachment
  runTest("Embed with Attachment", {
    embeds: [{ title: "Attached!", color: Utils.getRandomColor() }],
    files: [Utilities.newBlob("data", "text/plain", "data.txt")]
  });

  // 8. Advanced embed fields
  runTest("Advanced Embed", {
    embeds: [{
      title: "Advanced Node Test",
      color: Utils.getRandomColor(),
      fields: [
        { name: "Node Version", value: "v24", inline: true },
        { name: "Status", value: "Running", inline: true }
      ],
      footer: { text: "Local Test Runner" }
    }]
  });
`,
  context,
);

console.log("\n=== Test Suite Finished ===");
