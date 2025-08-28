# Project Brief: Back to Top Action Button

## 1. Project Goal

The primary goal of this project is to enhance the user experience in Obsidian by providing a simple, intuitive "Back to Top" navigation button that is automatically added to content pages. This feature is aimed at users who work with long-form notes with tables of contents, making it easier to return to the beginning of a document without manual scrolling.

## 2. Core Requirements

* **Functionality**: Display a floating action button that, when clicked, smoothly scrolls the active note pane to the top.
* **Smart Visibility**: The button must only appear after the user has scrolled a significant distance down the page, remaining hidden on short notes or at the top of a page.
* **Cross-Platform Compatibility**: The plugin must be fully functional on both Obsidian Desktop and Obsidian Mobile.
* **Mobile Adaptation**: On mobile devices, the plugin should intelligently adapt to the UI by:
    * Automatically positioning itself relative to the native Obsidian mobile toolbar.
    * Matching the mobile app's theme colors for a seamless look.
* **User Customization**: Provide a settings panel to allow users to configure the button's appearance (size, colors) and behavior (scroll threshold, position).

## 3. Constraints

* **Performance**: The plugin must be lightweight and have a negligible impact on Obsidian's performance.
* **Compatibility**: Must not conflict with Obsidian's core interface or other popular plugins. It requires a minimum Obsidian application version of `0.12.0`.
* **Dependency Free**: The plugin should rely solely on the Obsidian API and standard web technologies (JS, CSS) without external libraries to ensure stability and simplicity.