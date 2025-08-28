# Technical Context

## 1. Technology Stack

* **Language**: JavaScript (ES6+ features, using CommonJS `require` syntax).
* **Platform**: Obsidian Plugin API (`obsidian` package).
* **Environment**: Node.js (for development, building, and running scripts).

## 2. Development & Build Process

The project is configured for a professional development and release workflow.

* **Dependency Management**: `npm` is used to manage project dependencies listed in `package.json`.
* **Hot Reloading**: A custom script, `hot-reload.js`, allows for instant reloading of the plugin within Obsidian during development, dramatically speeding up the feedback cycle.
* **Automated Releases**: The project uses **`semantic-release`** to fully automate the release process. When changes are pushed to the `main` branch, a CI/CD pipeline (not defined here, but implied) will:
    1.  Analyze commit messages to determine the next version number (patch, minor, or major).
    2.  Build the plugin.
    3.  Generate release notes and a `CHANGELOG.md`.
    4.  Update `package.json` and `manifest.json` with the new version.
    5.  Create a `release.zip` file.
    6.  Create a Git tag for the new version.
    7.  Publish the release assets to GitHub.
* **Containerized Builds**: **Docker** is used to ensure a clean, consistent, and reproducible build environment (`Dockerfile` and `docker-compose.yaml`). This eliminates "it works on my machine" problems.

## 3. Technical Constraints & Dependencies

* **Obsidian API**: The plugin is fundamentally tied to the Obsidian API. Major changes to the API, especially concerning the DOM structure or workspace events, could require code updates.
* **DOM Structure**: The logic for finding scroll containers (`.cm-scroller`, `.markdown-preview-view`) and mobile UI elements relies on specific CSS class names used by Obsidian. These could change in future Obsidian updates, which is a key maintenance consideration.
* **External Dependencies**: The plugin has no external runtime dependencies, making it robust and self-contained. All `devDependencies` are for the build and release process only.