/** @fileoverview ESLint 9.x Flat Configuration for Google Apps Script */

const path = require("path");
const fs = require("fs");

module.exports = [
  // 1. Global Ignores
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
        Math: "readonly",
        Object: "readonly",
        JSON: "readonly",
        console: "readonly",
      },
    },
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      "no-unused-vars": "off",
      "no-console": "warn",
    },
  },

  // 3. Structural Governance
  {
    files: ["**/*.gs"],
    plugins: {
      governance: {
        rules: {
          structure: {
            create(context) {
              const srcPath = path.join(process.cwd(), "src");

              // Only run filesystem checks once per lint run
              if (context.filename.includes("Code.gs") || context.filename.includes("Api.gs")) {
                const rootPath = process.cwd();
                
                // 1. Forbidden folders
                ["Api", "Code"].forEach(folder => {
                  const folderPath = path.join(srcPath, folder);
                  if (fs.existsSync(folderPath) && fs.lstatSync(folderPath).isDirectory()) {
                    context.report({
                      loc: { line: 1, column: 0 },
                      message: `Folder 'src/${folder}' is forbidden. Use 'src/${folder}.gs' instead.`,
                    });
                  }
                });

                // 2. Required Project Files
                const requiredFiles = [
                  ".clasp.json",
                  ".governance.json",
                  "package.json",
                  "README.md",
                  "ARCHITECTURE.md",
                  "CONTRIBUTING.md",
                  "API.md",
                  "src/appsscript.json"
                ];

                requiredFiles.forEach(file => {
                  const filePath = path.join(rootPath, file);
                  if (!fs.existsSync(filePath)) {
                    context.report({
                      loc: { line: 1, column: 0 },
                      message: `Critical project file '${file}' is missing.`,
                    });
                  }
                });
              }

              return {
                Program(node) {
                  const relativePath = path.relative(srcPath, context.filename);
                  const fileName = path.basename(context.filename, ".gs");
                  const dirName = path.dirname(relativePath);

                  // Rule: Code.gs must only have entry points
                  if (fileName === "Code" && dirName === ".") {
                    node.body.forEach((item) => {
                      if (item.type === "FunctionDeclaration") {
                        const webEntryPoints = ["doGet", "doPost"];
                        if (!webEntryPoints.includes(item.id.name)) {
                          context.report({
                            node: item.id,
                            message:
                              "Code.gs must only contain web entry points (doGet, doPost).",
                          });
                        }
                      } else if (item.type === "VariableDeclaration") {
                        context.report({
                          node: item,
                          message:
                            "Code.gs must only contain function declarations for entry points.",
                        });
                      }
                    });
                  }

                  // Rule: Triggers must only have trigger functions
                  if (fileName === "Triggers" || dirName === "triggers") {
                    node.body.forEach((item) => {
                      if (item.type === "FunctionDeclaration") {
                        const triggers = [
                          "onOpen",
                          "onEdit",
                          "onInstall",
                          "onFormSubmit",
                          "onChange",
                          "onSelectionChange",
                        ];
                        if (!triggers.includes(item.id.name)) {
                          context.report({
                            node: item.id,
                            message:
                              "Triggers must only contain trigger functions (onOpen, onEdit, etc.).",
                          });
                        }
                      }
                    });
                  }

                  // Rule: Config.gs must be const CONFIG = Object.freeze({...})
                  if (fileName === "Config" && dirName === ".") {
                    const hasConfig = node.body.some(
                      (item) =>
                        item.type === "VariableDeclaration" &&
                        item.declarations[0].id.name === "CONFIG" &&
                        item.declarations[0].init?.type === "CallExpression" &&
                        item.declarations[0].init?.callee?.property?.name ===
                          "freeze",
                    );
                    if (!hasConfig) {
                      context.report({
                        node,
                        message:
                          "Config.gs must be: const CONFIG = Object.freeze({...})",
                      });
                    }
                  }

                  // Rule: Api.gs must only contain function declarations (exposed)
                  if (fileName === "Api" && dirName === ".") {
                    node.body.forEach((item) => {
                      if (
                        item.type !== "FunctionDeclaration" &&
                        item.type !== "ExpressionStatement" &&
                        item.type !== "EmptyStatement"
                      ) {
                        context.report({
                          node: item,
                          message:
                            "Api.gs should only contain exposed function declarations.",
                        });
                      }
                    });
                  }
                  // Rule: Services and Utils must be wrapped in IIFE named after file
                  // AND must be in their respective folders if they are individual service/utils files
                  const isServiceFile =
                    fileName.endsWith("Service") || fileName === "Services";
                  const isUtilsFile =
                    fileName.endsWith("Utils") || fileName === "Utils";

                  if (isServiceFile || isUtilsFile) {
                    const expectedFolder = isServiceFile ? "Services" : "Utils";
                    const isMainFile =
                      (fileName === "Services" || fileName === "Utils") &&
                      dirName === ".";

                    // Check folder placement
                    if (!isMainFile && dirName !== expectedFolder) {
                      context.report({
                        node,
                        message: `File '${fileName}.gs' must be located in the 'src/${expectedFolder}/' folder.`,
                      });
                    }

                    // Check IIFE wrapper
                    const expectedName = fileName;
                    const declarations = node.body.filter(
                      (n) => n.type === "VariableDeclaration",
                    );

                    const isCorrectWrapper =
                      declarations.length === 1 &&
                      declarations[0].declarations[0].id.name ===
                        expectedName &&
                      declarations[0].declarations[0].init?.type ===
                        "CallExpression";

                    if (!isCorrectWrapper) {
                      context.report({
                        node,
                        message: `File must be wrapped in an IIFE assigned to 'const ${expectedName}'.`,
                      });
                    }
                  }
                },
              };
            },
          },
        },
      },
    },
    rules: {
      "governance/structure": "error",
    },
  },
];
