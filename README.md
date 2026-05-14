# Discord.gs

A professional, clean, and highly modular Discord Webhook library for Google Apps Script.

## Overview
`Discord.gs` allows you to easily send messages and embeds to Discord from your Google Apps Script projects. It follows a strict architectural standard to ensure maintainability and scalability.

## Features
- **Simple API:** Send messages with a single function call.
- **Embed Support:** Full support for Discord embeds.
- **Default Branding:** Automatically uses "Google Script Bot" and Google avatar if not specified.
- **Modular Design:** Built with a clean separation of concerns (Code, Services, Api, Utils).
- **Type Safety:** Includes JSDoc for better IDE support.

## Getting Started
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Clasp:**
   - Log in to Clasp: `npx clasp login`
   - Update `.clasp.json` with your `scriptId`.
   - **Note:** Ensure "Google Apps Script API" is enabled in your [Google Apps Script Settings](https://script.google.com/home/usersettings).
   - Push your code: `npx clasp push`
4. **Follow the instructions** in [CONTRIBUTING.md](./CONTRIBUTING.md).

## Project Structure
- `.github/`: CI/CD workflows, issue templates, and security policy.
- `appsscript.json`: Google Apps Script manifest file.
- `.clasp.json`: Clasp configuration for local development.
- `ARCHITECTURE.md`: High-level system design.
- `API.md`: Documentation for API endpoints or interfaces.
- `CONTRIBUTING.md`: Guidelines for contributors.
- `*.gs`: Apps Script source files.

## License
[Insert License Here]
