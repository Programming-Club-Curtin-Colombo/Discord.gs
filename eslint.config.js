/** @fileoverview ESLint 9.x Flat Configuration for Google Apps Script */

module.exports = [
  // 1. Global Ignores (replacing .eslintignore)
  {
    ignores: [
      "node_modules/**",
      "coverage/**",
      "dist/**",
      "**/*.json",
      "package-lock.json",
    ],
  },

  // 2. Base Configuration for .gs and .js files
  {
    files: ["**/*.gs", "**/*.js"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "script",
      globals: {
        // Google Apps Script Globals
        Logger: "readonly",
        SpreadsheetApp: "readonly",
        DriveApp: "readonly",
        DocumentApp: "readonly",
        FormApp: "readonly",
        GmailApp: "readonly",
        PropertiesService: "readonly",
        Utilities: "readonly",
        ScriptApp: "readonly",
        Session: "readonly",
        ContentService: "readonly",
        UrlFetchApp: "readonly",
        HtmlService: "readonly",
        CacheService: "readonly",
        LockService: "readonly",
      },
    },
    rules: {
      // BASE SAFETY RULES
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": "off", // Global functions in GAS are entry points
      "no-console": "warn",

      // NAMING CONVENTION SYSTEM
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "FunctionDeclaration[id.name=/^(?!Services_|Utils_|Api_|on|doGet|doPost)/]",
          message:
            "All functions must follow naming convention: Services_, Utils_, Api_ prefixes or GAS entry points.",
        },
      ],
    },
  },

  // 3. Layer-Specific Overrides
  {
    files: ["src/Code.gs"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // Allow standard GAS entry points OR library public functions (send*)
          selector:
            "FunctionDeclaration[id.name=/^(?!doGet|doPost|onOpen|onEdit)/]",
          message:
            "Code.gs must only contain entry points (doGet, doPost, etc.).",
        },
      ],
    },
  },
  {
    files: ["src/tests/**/*.gs"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "FunctionDeclaration[id.name=/^(?!test_|Services_|Utils_|Api_)/]",
          message:
            "Test functions must be prefixed with test_, Services_, Utils_, or Api_.",
        },
      ],
    },
  },
  {
    files: ["src/Utils.gs"],
    rules: {
      "no-restricted-globals": [
        "error",
        "SpreadsheetApp",
        "DriveApp",
        "UrlFetchApp",
        "Logger",
        "GmailApp",
        "PropertiesService",
        "ScriptApp",
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration[id.name=/^Services_/]",
          message: "Utils cannot define Services-layer functions.",
        },
      ],
    },
  },
  {
    files: ["src/Services.gs"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration[id.name=/^Api_/]",
          message: "API logic must be placed in Api.gs, not Services.gs.",
        },
        {
          selector:
            "CallExpression[callee.name=/UrlFetchApp|SpreadsheetApp|DriveApp/]",
          message:
            "Services must use Api.gs or Utils.gs for external/GAS API calls.",
        },
      ],
    },
  },
  {
    files: ["src/Api.gs"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration[id.name=/^(?!Api_)/]",
          message: "Api.gs functions must follow Api_ naming convention.",
        },
      ],
    },
  },
  {
    files: ["src/Config.gs"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration",
          message: "Config.gs must not contain functions.",
        },
        {
          selector: "AssignmentExpression",
          message: "Config.gs must be immutable.",
        },
      ],
    },
  },
];
