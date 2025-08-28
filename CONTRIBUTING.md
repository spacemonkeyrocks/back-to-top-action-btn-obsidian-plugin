## Contributing

Contributions are welcome!

_If you have a suggestion or find a bug, please open an issue first to discuss it._

## Plugin Architecture

The plugin source code is organized in the `src/` directory with multiple files for better maintainability:

- `src/main.js` - Entry point and core plugin class
- `src/button-manager.js` - Button creation, positioning, event handling
- `src/mobile-utils.js` - Mobile-specific functionality (detection, theme colors)
- `src/settings.js` - Settings UI and management
- `src/logger.js` - Logging utilities
- `manifest.json` - Plugin metadata (root level)
- `styles.css` - CSS styles (root level)

## Pull Requests
1. Fork the repository.
2. Create a new branch for your feature or bug fix (e.g., `feat/add-new-setting` or `fix/mobile-positioning-bug`).
3. Make your changes in the `src/` directory.
4. Test your change both on the Desktop and Mobile devices, see [Testing](#testing)
5. Create a commit message that follows the Conventional Commits specification, see [Commit Message Convention](#commit-message-convention).
6. Submit a pull request with a clear description of your changes.

## Testing

Thorough testing is crucial to ensure the plugin works reliably for everyone. To test and debug the Android App see [Debugging Android App](#android-app).

When you make a change, please test the following on both **Desktop** and **Mobile** (unless otherwise specified).

Core Functionality

- [ ] Does the button appear and disappear correctly when scrolling past the `scrollThreshold`?
- [ ] Does clicking the button smoothly scroll the note to the top?
- [ ] Does the button work correctly in both **Live Preview** and **Reading Mode**?
- [ ] Does the button correctly remain hidden on notes that are too short to scroll?

Settings & Customization

- [ ] Do all settings (color, size, position) apply correctly and instantly?
- [ ] Does the settings panel display the correct layout (e.g., "Desktop Settings" first on desktop, "Mobile Settings" first on mobile)?
- [ ] Does the toggle to show the other platform's settings work correctly?
- [ ] Does the "Enable debugging" toggle correctly show and hide the advanced debug options?
- [ ] Is there no flicker or brief reappearance of the button in the note view when a setting is changed?

Mobile-Specific Behavior

- [ ] Does the "Auto-adapt for mobile" feature correctly position the button relative to the native edit/read mode button?
- [ ] Does the "Use mobile theme colors" feature correctly detect and apply the theme colors?
- [ ] Does the button correctly hide when the on-screen keyboard appears and reappear after it is dismissed?

Lifecycle & Edge Cases

- [ ] Does the plugin still work after reloading Obsidian?
- [ ] Does the plugin still work after switching between different notes?
- [ ] Does the button correctly disappear when switching to a non-note view (like the Graph View or Canvas)?
- [ ] Does the button get removed properly when the plugin is disabled?

## Publishing
This repository uses [semantic-release](https://github.com/semantic-release/semantic-release) to automate the release process. Publishing is handled automatically by a GitHub Action when commits are pushed to the `main` branch.

### Commit Message Convention
To trigger a release, your commit messages must follow the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/).

- `feat:` - A new feature. This will trigger a minor release (e.g., `1.1.0`).
- `fix:` - A bug fix. This will trigger a patch release (e.g., `1.0.1`).
- `BREAKING CHANGE:` - A commit that has a footer BREAKING CHANGE: or appends a ! after the type/scope will trigger a major release (e.g., `2.0.0`).
- Other commit types like `chore:`, `docs:`, `style:`, `refactor:`, `test:` will not trigger a release.

### The Release Process
Releasing is fully automatic:
1. When a pull request with `feat:` or `fix:` commits is merged into `main`, the release workflow is triggered.
2. `semantic-release` analyzes the commits, determines the next version number, and generates release notes.
3. The `package.json`, `manifest.json`, and `versions.json` files are automatically updated with the new version.
4. A new tag is created on GitHub.
5. A new GitHub Release is created with the release notes and the plugin files from `src/` (`main.js`, `button-manager.js`, `mobile-utils.js`, `logger.js`, `settings.js`) and root (`manifest.json`, `styles.css`) attached as assets.
6. The `brianrodri/semantic-release-obsidian-plugin` package ensures that the version in the `manifest.json` is updated to match the new version created by `semantic-release`. The new release is automatically picked up by the Obsidian Community Plugin repository, because the plugin has been [submitted](RELEASING.md#important-note-the-publishing-process).

## Debugging

### Using the builtin Debugging Tools
To get detailed information from the plugin, you must first enable the debugging options in the plugin's settings:
1. Go to `Settings` -> `Community Plugins` -> `Back to Top Action Button`.
2. Turn on **"Enable debugging"**. This will reveal the other debug settings.
3. Set the *"Log level"* to control the amount of detail you see.

**Log Levels:**
- **Error**: Critical errors only
- **Warn**: Warnings and errors
- **Info**: General lifecycle messages (e.g., "Settings opened", "Button clicked").
- **Debug**: Detailed information about function calls and settings used.
- **Verbose**: More detailed information, such as which DOM elements are being detected.
- **Trace**: The most detailed level, showing every search keystroke and tab detection event.

4. Turn on **"Enable file logging"** to also log to a file .

The log file is located at: `.obsidian/plugins/back-to-top-action-btn/debug.log`

**On Mobile:**
The settings tab on mobile includes a **"Debug Info"** section. This is extremely useful as it shows a live snapshot of the current plugin state, including:
- Button positioning information
- Detection method used

### Emulate mobile device in Obsidian Desktop
You can emulate Obsidian running a mobile device directly from the Developer Tools.
1. Open the `Developer Tools`.
2. Select the `Console tab`.
3. Enter the following and then press `Enter`.

    ```js
    this.app.emulateMobile(true);
    ```

To disable mobile emulation, enter the following and press Enter:

```js
this.app.emulateMobile(false);
```

> To instead toggle mobile emulation back and forth, you can use the this.app.isMobile flag:
> ```js
> this.app.emulateMobile(!this.app.isMobile);
> ```

### Android App
> Have you installed the OEM USB driver on your computer necessary for Remote Debugging for Android? If not, go to [this](https://developer.android.com/studio/run/oem-usb) webpage and select your Android device's brand and install the device driver. After installation you might have to restart your phone and computer, see Trouble Shooting for more tips.

Here are the steps to enable Remote Debugging for Android:
1. **On your Phone:** Enable Developer Options.
    - Go to `Settings` -> `About phone`.
    - Tap on `Build number` 7 times until it says "You are now a developer!"
2. **On your Phone:** Enable USB Debugging.
    - Go to `Settings` -> `System` -> `Developer options`.
    - Turn on the **USB debugging** toggle.
3. **Connect Phone to Computer:** Use a USB cable to connect your phone to your computer. On your phone, a prompt will appear asking to "Allow USB debugging". Tap "Allow".
4. **On your Computer:** Open the Chrome browser.
5. **Navigate to `chrome://inspect`**.
6. **On your Phone:** Open Obsidian.
7. You should see your phone appear under "Remote Target". Below it, you'll see an entry for Obsidian with an "inspect" link. Click **inspect**.

#### Trouble Shooting
Here are the most frequent causes and solutions for the device not showing up under devices in `chrome://inspect`:
1. **Phone Authorization:** After enabling USB debugging and plugging in the cable, a popup should appear on your phone asking you to **"Allow USB debugging"** from this specific computer. If you missed it, unplug and replug the cable. Sometimes it appears in your phone's notification shade.
2. **USB Connection Mode:** By default, most phones connect in "Charging only" mode.
    - Swipe down from the top of your phone's screen to see notifications.
    - Tap the "Charging this device via USB" notification.
    - Change the mode from "Charging only" to **"File transfer"** or **"PTP"**. This is the most common fix.
3. **Drivers (Windows Users):** If you are on Windows, you often need to install the specific ADB/USB drivers for your phone's manufacturer (e.g., Samsung, Google, etc.). You can find a list of official drivers on Google's [OEM USB Drivers page](https://developer.android.com/studio/run/oem-usb).
4. **Bad Cable or Port:**
    - Try a different USB cable. Some cheaper cables are designed for charging only and don't transfer data.
    - Try a different USB port on your computer.
5. **Restart Everything:** The classic solution. Restart your phone, restart your computer, and restart the Chrome browser.

## Desktop Testing Note
This plugin is designed exclusively for mobile devices. When testing on desktop, the plugin will display an error message and refuse to initialize. This is expected behavior - all testing must be done on actual mobile devices or mobile browser debugging tools.

Thank you for your help!