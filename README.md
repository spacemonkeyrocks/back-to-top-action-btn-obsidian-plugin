# Back to Top Action Button for Obsidian

A smart, customizable, floating "Back to Top" button that enhances navigation in long notes on both desktop and mobile.

## Features

-   **Instant Navigation**: Smoothly scroll to the top of any long note with a single click.
-   **Smart Visibility**: The button intelligently fades into view only after you scroll past a customizable distance.
-   **Cross-Platform Design**: Works seamlessly across Desktop (Windows, macOS, Linux) and Mobile (Android, iOS).
-   **Advanced Mobile Adaptation**:
    -   **Auto-Positioning**: Automatically positions itself above the native Obsidian mobile UI for a perfect fit.
    -   **Auto-Theming**: Detects and applies your mobile theme's colors for a native look and feel.
-   **Highly Customizable**: Independently configure the button's size, position, and colors for desktop and mobile.
-   **Lightweight & Efficient**: Built to be performant with a minimal footprint and no external dependencies.

## How It Works

1.  **Scroll Down**: As you scroll down in a note longer than the configured threshold, the button fades into view.
2.  **Click to Return**: Click the floating button at any time.
3.  **Smooth Scroll**: The note smoothly animates back to the top.

## Installation

### From Obsidian Community Plugins
1.  Open Obsidian **Settings**.
2.  Go to **Community Plugins** and turn off "Safe Mode".
3.  Click **Browse** and search for "Back to Top Action Button".
4.  Click **Install**, then **Enable** the plugin.
5.  Customize options under the plugin's settings tab.

### Manual Installation
1.  Go to the latest [GitHub release page](https://github.com/spacemonkeyrocks/back-to-top-action-btn-obsidian-plugin/releases).
2.  Download the `back-to-top-action-btn-[version].zip` file.
3.  Unzip the file into your Obsidian vault's `.obsidian/plugins/` directory.
4.  Reload Obsidian, then enable the plugin in the **Community Plugins** settings.

## Settings

### General Settings
-   **Scroll threshold**: The number of pixels you need to scroll down before the button appears.
-   **Show on page load**: Makes the button visible immediately on any note, regardless of scroll position.

### Desktop Settings
-   **Button size**: The diameter of the button in pixels.
-   **Arrow size**: The size of the arrow icon inside the button.
-   **Bottom position**: The distance from the bottom of the screen.
-   **Right position**: The distance from the right of the screen.
-   **Button color & Text color**: Customize the button's appearance with color pickers.

### Mobile Settings
-   **Auto-adapt for mobile**: When enabled, the plugin automatically positions the button above the native edit/read mode button.
-   **Use mobile theme colors**: When enabled, the plugin automatically uses your theme's accent colors.
-   **Manual positioning**: If auto-adapt is disabled, you can manually set the button's size and position.

### Debug Settings
-   **Enable debugging**: Turn on detailed logging for troubleshooting.
-   **Log level**: Control the verbosity of debug information (from Error to Trace).
-   **File logging**: Write debug logs to `.obsidian/plugins/back-to-top-action-btn/debug.log`.
-   **Live debug info**: A real-time status panel (mobile only) to inspect the plugin's state.

## Platform Support

| Platform        | Support         |
| --------------- | --------------- |
| Android Mobile  | ✅ Full Support |
| iOS Mobile      | ✅ Full Support |
| Desktop         | ✅ Full Support |
| Tablet          | ✅ Full Support |

## Troubleshooting

### Common Issues

**Button doesn't appear:**
-   Ensure you have scrolled down further than the `scrollThreshold` set in the settings.
-   Verify you are in a standard markdown note view. The button is not designed to appear in other views like the Graph View or Canvas.

**Button is in the wrong place on mobile:**
-   Ensure "Auto-adapt for mobile" is enabled for the best experience.
-   If your theme significantly alters the mobile UI, auto-detection may fail. In this case, disable auto-adapt and set the position manually.

**Button flickers when changing settings:**
-   This was a bug in older versions. Please ensure your plugin is updated to the latest release.

## Development

This plugin is built with a clean, modular architecture.
-   **Lightweight Update Mechanism**: Uses a dedicated function to update button styles without a full redraw, preventing UI flicker.
-   **State-Aware**: Tracks the settings panel's state to prevent conflicts between the UI and the button's visibility logic.

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Support

-   **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/spacemonkeyrocks/back-to-top-action-btn-obsidian-plugin/issues).

## License

This project is licensed under the MIT License. See the [LICENSE.md](LICENSE.md) file for details.