# Developer Guide

This guide provides instructions for setting up the development environment to contribute to this Obsidian plugin.

## Plugin Architecture

The plugin source code is organized in the `src/` directory with multiple modules for maintainability:

```
src/
├── main.js              # Entry point and core plugin class
├── button-manager.js    # Button creation, positioning, event handling  
├── mobile-utils.js      # Mobile-specific functionality (detection, theme colors)
├── settings.js          # Settings UI and management
└── logger.js            # Logging utilities
```

A build process bundles these source files into a single `main.js` in the project root for distribution.
Root level files:
- `manifest.json` - Plugin metadata (required by Obsidian)
- `styles.css` - CSS styles
- `package.json` - Build configuration and dependencies

## Local Development Setup

This method involves installing the necessary tools directly on your machine and is recommended for active, iterative development.

**Prerequisites**
- [Node.js](https://nodejs.org/en) (version 18 or higher)
- npm (comes with Node.js)
- A test Obsidian vault, separate from your main vault.

### Step 1: Clone and Install Dependencies
```bash
git clone [https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git)
cd YOUR_REPO_NAME
npm install
```

### Step 2: Configure Your Test Vault
Create a `.env` file in the project root. This file tells the scripts where your test vault is located and allows you to configure hot reloading.

```
# .env file
OBSIDIAN_VAULT=/path/to/your/test/vault
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
HOT_RELOAD=true
```

### Step 3: Install the Plugin
The `install.sh` script connects your project to your test vault. Use the `--link` mode for the best development experience. You only need to run this **once per vault**.

```bash
./install.sh --link
```

### Step 4: Set Up Hot Reloading (Recommended)
For the best development experience, you can enable automatic reloading of the plugin inside Obsidian.

1.  **In your test vault:** Go to `Settings` -> `Community Plugins`, search for and install the **"Hot-Reload"** plugin.
2.  **In your `.env` file:** Make sure `HOT_RELOAD=true` is set.

### Step 5: Start Developing
Run the `watch` script. This will monitor your source files, rebuild `main.js` on changes, and automatically trigger the hot reload in Obsidian.

```bash
npm run watch
```
You can now edit your code in `src/`, and your changes will appear in Obsidian automatically after you save.

## Available Scripts

| Script          | Purpose                                                                                                  |
|-----------------|----------------------------------------------------------------------------------------------------------|
| `build`         | Creates a single, production-ready `main.js` file after running format and lint checks.                  |
| `watch`         | **Use this for development.** Automatically rebuilds `main.js` and hot-reloads Obsidian on file changes. |
| `install:vault` | A helper script that runs the installer in copy mode (`--install`).                                      |
| `dev`           | A one-time command that builds, bumps the patch version, and installs the plugin by copying.             |
| `lint`          | Checks your code for potential errors and style issues.                                                  |
| `format`        | Automatically reformats all your code to ensure a consistent style.                                      |
| `release:dry`   | Simulates a full release to test your configuration without publishing anything.                         |
| `release:test`  | Tests the release process in a clean Docker container, mimicking the CI/CD environment.                  |

## Docker-based Setup

This project uses Docker to provide a clean, isolated environment for running one-off tasks like simulating a release. This is not the recommended workflow for day-to-day coding, as the Local Setup is much faster.

For detailed instructions on how to build the Docker image and run a release dry-run, please see the **[RELEASING.md](RELEASING.md)** guide.

## Working with the Multi-File Architecture

When developing with the new `src/` directory structure:

**File Dependencies:**
- `src/main.js` imports from all other files
- `src/button-manager.js` imports from `src/mobile-utils.js`
- `src/settings.js` imports from `src/logger.js`
- `src/logger.js` and `src/mobile-utils.js` have no dependencies

**Making Changes:**
- **Core functionality**: Edit `src/main.js` for plugin lifecycle and coordination
- **Button behavior**: Edit `src/button-manager.js` for button creation, styling, and interactions
- **Mobile features**: Edit `src/mobile-utils.js` for mobile-specific detection and positioning
- **Settings UI**: Edit `src/settings.js` for configuration interface
- **Logging**: Edit `src/logger.js` for debug output and log levels

**Testing Changes:**
If you used the `--link` setup, simply reload the plugin in Obsidian after the watcher rebuilds your code. If you used `--install`, you must run `./install.sh --install` again before reloading.

## File Structure Reference

```
project-root/
├── src/                     # Source code directory
│   ├── main.js              # Entry point, plugin lifecycle
│   ├── button-manager.js    # Button creation and behavior
│   ├── mobile-utils.js      # Mobile detection utilities
│   ├── settings.js          # Settings UI and defaults
│   └── logger.js            # Logging system
├── .env                     # (Optional) For storing your vault path
├── .releaserc.json          # Release configuration
├── main.js                  # The final, bundled plugin file (generated by build)
├── manifest.json            # Plugin metadata
├── styles.css               # CSS styles
├── package.json             # Node.js dependencies
└── install.sh               # Development installation script
```