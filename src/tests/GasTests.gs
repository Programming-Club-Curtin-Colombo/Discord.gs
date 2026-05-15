/**
 * ManualTest.gs
 * Suite of manual tests for Discord.gs to verify various message structures.
 *
 * IMPORTANT: Ensure 'announcements' and 'moderator-text' script properties
 * are set with valid Discord webhook URLs before running these tests.
 */

/**
 * Internal helper to run a test case for both announcement and moderator channels.
 * @param {string} name - Name of the test case.
 * @param {Object|string} options - Message options or content string.
 */
function runTestScenario(name, options) {
  Logger.log(`\n[TEST] Running Scenario: ${name}`);

  Logger.log("[TEST] Dispatching to Announcement channel...");
  try {
    sentToAnnouncement(options);
    Logger.log("[TEST] Announcement: SUCCESS");
  } catch (e) {
    Logger.log("[TEST] Announcement: FAILED - " + e.message);
  }

  Logger.log("[TEST] Dispatching to Moderator channel...");
  try {
    sendToModeratorText(options);
    Logger.log("[TEST] Moderator: SUCCESS");
  } catch (e) {
    Logger.log("[TEST] Moderator: FAILED - " + e.message);
  }
}

/**
 * 1. Normal Message
 */
function test_normalMessage() {
  runTestScenario("Normal Message", "This is a normal test message.");
}

/**
 * 2. Message with attachment image
 */
function test_messageWithImage() {
  const imageUrl =
    "https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png";
  const imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();
  imageBlob.setName("google_logo.png");

  runTestScenario("Message with Image Attachment", {
    content: "Here is a logo for you!",
    files: [imageBlob],
  });
}

/**
 * 3. Attachment with txt
 */
function test_messageWithTextFile() {
  const textBlob = Utilities.newBlob(
    "Hello, this is a text file content.",
    "text/plain",
    "hello.txt",
  );

  runTestScenario("Message with Text File", {
    content: "Sending a text file as attachment.",
    files: [textBlob],
  });
}

/**
 * 4. Message with one embed
 */
function test_messageWithOneEmbed() {
  const embed = {
    title: "Single Embed Test",
    description: "This is a test with a message AND an embed.",
    color: Utils.getRandomColor(),
  };

  runTestScenario("Message with One Embed", {
    content: "Look at this embed:",
    embeds: [embed],
  });
}

/**
 * 5. Embed alone
 */
function test_embedAlone() {
  const embed = {
    title: "Lonely Embed",
    description: "I have no top-level message content.",
    color: Utils.getRandomColor(),
  };

  runTestScenario("Embed Alone", {
    embeds: [embed],
  });
}

/**
 * 6. Two embeds
 */
function test_twoEmbeds() {
  const embeds = [
    {
      title: "Embed One",
      description: "First part of the message.",
      color: Utils.getRandomColor(),
    },
    {
      title: "Embed Two",
      description: "Second part of the message.",
      color: Utils.getRandomColor(),
    },
  ];

  runTestScenario("Two Embeds", {
    content: "Double Trouble:",
    embeds: embeds,
  });
}

/**
 * 7. Embed with attachment
 */
function test_embedWithAttachment() {
  const textBlob = Utilities.newBlob(
    "Internal logs...",
    "text/plain",
    "logs.txt",
  );
  const embed = {
    title: "System Log Export",
    description: "Please find the attached log file below.",
    color: Utils.getRandomColor(),
  };

  runTestScenario("Embed with Attachment", {
    embeds: [embed],
    files: [textBlob],
  });
}

/**
 * 8. Advanced embed fields (images, etc.)
 */
function test_advancedEmbedFields() {
  const embed = {
    title: "Advanced Embed",
    description: "Testing fields, thumbnails, and images.",
    color: Utils.getRandomColor(),
    thumbnail: {
      url: "https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png",
    },
    image: {
      url: "https://www.gstatic.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png",
    },
    fields: [
      {
        name: "Field 1",
        value: "This is an inline field",
        inline: true,
      },
      {
        name: "Field 2",
        value: "This is another inline field",
        inline: true,
      },
      {
        name: "Full Width Field",
        value: "This field takes the full width of the embed.",
        inline: false,
      },
    ],
    footer: {
      text: "Advanced Test Suite",
      icon_url:
        "https://www.gstatic.com/images/branding/googleg/1x/googleg_standard_color_128dp.png",
    },
  };

  runTestScenario("Advanced Embed Fields", {
    content: "Running advanced UI test:",
    embeds: [embed],
  });
}

/**
 * 9. Comprehensive Full Suite
 * Runs all tests sequentially.
 */
function test_runFullSuite() {
  test_normalMessage();
  test_messageWithImage();
  test_messageWithTextFile();
  test_messageWithOneEmbed();
  test_embedAlone();
  test_twoEmbeds();
  test_embedWithAttachment();
  test_advancedEmbedFields();
}
