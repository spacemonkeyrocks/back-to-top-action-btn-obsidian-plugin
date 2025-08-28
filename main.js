var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/mobile-utils.js
var require_mobile_utils = __commonJS({
  "src/mobile-utils.js"(exports2, module2) {
    var MobileUtils = class {
      constructor(plugin) {
        this.plugin = plugin;
      }
      async findMobileButtonElement() {
        this.plugin.logger.logDebug(
          "Attempting to find mobile button element..."
        );
        const selectors = [
          '.view-actions .view-action[aria-label*="Current view"]'
          // Target the specific button
        ];
        const maxAttempts = 10;
        const intervalTime = 50;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          for (const selector of selectors) {
            this.plugin.logger.logTrace(`Checking selector "${selector}"`);
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
              const rect = element.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                if (rect.top > window.innerHeight / 2) {
                  this.plugin.logger.logVerbose(
                    `\u2713 Found valid mobile button: ${rect.width}x${rect.height} at ${rect.left},${rect.top}`
                  );
                  return element;
                }
              }
            }
          }
          this.plugin.logger.logTrace(
            `Attempt ${attempt + 1}/${maxAttempts}, waiting ${intervalTime}ms`
          );
          await new Promise((resolve) => setTimeout(resolve, intervalTime));
        }
        this.plugin.logger.logWarn(
          "\u2717 No mobile button found with any valid selector."
        );
        return null;
      }
      async findMobileButtonElementDebug() {
        this.plugin.logger.logDebug(
          "Attempting to find mobile button element..."
        );
        const selectors = [
          '.view-actions .view-action[aria-label*="Current view"]',
          ".floating-action-btn",
          ".mod-cta .clickable-icon",
          ".mobile-toolbar .clickable-icon",
          ".view-actions .view-action"
        ];
        this.plugin.logger.logDebug("=== DEBUGGING ALL MATCHING ELEMENTS ===");
        selectors.forEach((selector) => {
          const elements = document.querySelectorAll(selector);
          this.plugin.logger.logDebug(
            `Selector "${selector}" found ${elements.length} elements`
          );
          elements.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const style = getComputedStyle(element);
            this.plugin.logger.logDebug(`Element ${index}:`);
            this.plugin.logger.logDebug(
              `  - innerHTML: ${element.innerHTML.substring(0, 100)}`
            );
            this.plugin.logger.logDebug(
              `  - className: ${element.className}`
            );
            this.plugin.logger.logDebug(
              `  - aria-label: ${element.getAttribute("aria-label")}`
            );
            this.plugin.logger.logDebug(
              `  - rect: ${rect.left}, ${rect.top}, ${rect.width}x${rect.height}`
            );
            this.plugin.logger.logDebug(`  - display: ${style.display}`);
            this.plugin.logger.logDebug(
              `  - visibility: ${style.visibility}`
            );
            this.plugin.logger.logDebug(`  - opacity: ${style.opacity}`);
            this.plugin.logger.logDebug(`  - position: ${style.position}`);
            this.plugin.logger.logDebug(
              `  - transform: ${style.transform}`
            );
            this.plugin.logger.logDebug(
              `  - offsetParent: ${element.offsetParent ? element.offsetParent.tagName : "null"}`
            );
            this.plugin.logger.logDebug(
              `  - offsetWidth/Height: ${element.offsetWidth}x${element.offsetHeight}`
            );
            this.plugin.logger.logDebug(
              `  - clientWidth/Height: ${element.clientWidth}x${element.clientHeight}`
            );
            this.plugin.logger.logDebug(`  ---`);
          });
        });
        this.plugin.logger.logDebug("=== ALL BUTTONS IN BOTTOM HALF ===");
        const allButtons = document.querySelectorAll("button, .clickable-icon");
        allButtons.forEach((button, index) => {
          const rect = button.getBoundingClientRect();
          if (rect.top > window.innerHeight / 2) {
            this.plugin.logger.logDebug(
              `Bottom button ${index}: ${button.className}, ${rect.width}x${rect.height} at ${rect.left},${rect.top}`
            );
          }
        });
        return null;
      }
      async getMobileThemeProperties() {
        this.plugin.logger.logDebug("Get mobile theme properties");
        if (this.plugin.app.isMobile && this.plugin.settings.useMobileThemeColors) {
          const element = await this.findMobileButtonElement();
          if (element) {
            const style = getComputedStyle(element);
            const buttonColor = [
              style.backgroundColor,
              style.getPropertyValue("--interactive-accent"),
              style.getPropertyValue("--color-accent")
            ].find(
              (c) => c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent" && c.trim() !== ""
            );
            if (buttonColor) {
              const textColor = [
                style.color,
                style.getPropertyValue("--text-on-accent"),
                style.getPropertyValue("--text-normal"),
                "#ffffff"
              ].find((c) => c && c.trim() !== "");
              const buttonOpacity = style.opacity || "1";
              this.plugin.logger.logVerbose(
                `Found valid properties from element`
              );
              return { buttonColor, textColor, buttonOpacity };
            }
          }
        }
        return null;
      }
      async detectMobileButtonPosition() {
        this.plugin.logger.logDebug("Detect mobile button position");
        if (this.plugin.app.isMobile && this.plugin.settings.autoAdaptMobile) {
          const mobileButton = await this.findMobileButtonElement();
          if (mobileButton) {
            const rect = mobileButton.getBoundingClientRect();
            const buttonSize = Math.round(Math.max(rect.width, rect.height)) + "px";
            const offsetPx = parseInt(
              this.plugin.settings.mobileButtonOffset.replace("px", "")
            );
            const bottomPos = window.innerHeight - rect.top + offsetPx + "px";
            const rightPos = window.innerWidth - rect.right + "px";
            const detectionInfo = {
              selector: mobileButton.className,
              originalRect: `${rect.left}, ${rect.top}, ${rect.width}x${rect.height}`,
              calculatedPosition: `${rightPos} from right, ${bottomPos} from bottom`,
              detectedSize: buttonSize
            };
            return {
              bottom: bottomPos,
              right: rightPos,
              size: buttonSize,
              detectionInfo
            };
          }
        }
        return null;
      }
    };
    module2.exports = { MobileUtils };
  }
});

// src/button-manager.js
var require_button_manager = __commonJS({
  "src/button-manager.js"(exports2, module2) {
    var { MarkdownView } = require("obsidian");
    var { MobileUtils } = require_mobile_utils();
    var ButtonManager2 = class {
      constructor(plugin) {
        this.plugin = plugin;
        this.mobileUtils = new MobileUtils(plugin);
        this.debugInfo = {};
      }
      async updateButtonAppearance() {
        this.plugin.logger.logDebug(
          "Starting updateButtonAppearance (lightweight)"
        );
        const button = document.querySelector(".back-to-top-btn");
        if (!button) {
          this.plugin.logger.logWarn(
            "updateButtonAppearance called but no button found, running full creation."
          );
          this.addBackToTopButton();
          return;
        }
        try {
          const settings = await this.getEffectiveSettings();
          this.plugin.logger.logDebug(
            `Applying new dynamic styles: ${JSON.stringify(settings)}`
          );
          this.applyDynamicStyles(button, settings);
          const checkScroll = this.createScrollChecker(button, settings);
          checkScroll();
        } catch (error) {
          this.plugin.logger.logError(
            `ERROR in updateButtonAppearance: ${error.stack || error}`
          );
        }
      }
      async addBackToTopButton() {
        const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
          const existingButton2 = document.querySelector(".back-to-top-btn");
          if (existingButton2) existingButton2.remove();
          this.plugin.logger.logDebug(
            "Not in a markdown view, skipping addBackToTopButton"
          );
          return;
        }
        this.plugin.logger.logDebug(
          "Starting addBackToTopButton (full creation)"
        );
        this.debugInfo = {
          isMobile: this.plugin.app.isMobile,
          timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString()
        };
        const existingButton = document.querySelector(".back-to-top-btn");
        if (existingButton) {
          this.plugin.logger.logTrace("Removing existing button");
          existingButton.remove();
        }
        try {
          const settings = await this.getEffectiveSettings();
          this.debugInfo.settings = settings;
          const button = this.createButton();
          this.applyCoreStyles(button, settings);
          this.addEventListeners(button, settings);
          document.body.appendChild(button);
          this.plugin.logger.logVerbose("Button added to document body");
          await this.setupMobileVisibilityObserver(button, settings);
        } catch (error) {
          this.plugin.logger.logError(
            `ERROR in addBackToTopButton: ${error.stack || error}`
          );
        }
      }
      createButton() {
        const button = document.createElement("button");
        button.className = "back-to-top-btn";
        button.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 3L6 9L7.5 10.5L11 7V21H13V7L16.5 10.5L18 9L12 3Z" fill="currentColor"/>
</svg>`;
        button.title = "Back to Top";
        return button;
      }
      applyDynamicStyles(button, settings) {
        Object.assign(button.style, {
          bottom: settings.bottomPosition,
          right: settings.rightPosition,
          width: settings.buttonSize,
          height: settings.buttonSize,
          backgroundColor: settings.buttonColor,
          color: settings.textColor
        });
        this.plugin.logger.logDebug(
          `Button styles updated: size=${settings.buttonSize}, position=${settings.rightPosition} from right, ${settings.bottomPosition} from bottom, colors=${settings.buttonColor}/${settings.textColor}`
        );
      }
      applyCoreStyles(button, settings) {
        this.applyDynamicStyles(button, settings);
        Object.assign(button.style, {
          position: "fixed",
          borderRadius: "50%",
          border: "none",
          fontSize: "0",
          fontWeight: "bold",
          cursor: "pointer",
          opacity: "0",
          visibility: "hidden",
          transition: "opacity 0.3s ease, visibility 0.3s ease, transform 0.2s ease",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: "1",
          zIndex: "999"
        });
        const svg = button.querySelector("svg");
        if (svg) {
          svg.style.setProperty("width", "28px", "important");
          svg.style.setProperty("height", "28px", "important");
          svg.style.setProperty("min-width", "28px", "important");
          svg.style.setProperty("min-height", "28px", "important");
        }
      }
      addEventListeners(button, settings) {
        button.addEventListener("mouseenter", () => {
          button.style.transform = "scale(1.1)";
          button.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.2)";
        });
        button.addEventListener("mouseleave", () => {
          button.style.transform = "scale(1)";
          button.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
        });
        button.addEventListener("click", () => {
          this.scrollToTop();
        });
        const checkScroll = this.createScrollChecker(button, settings);
        this.addScrollListeners(checkScroll);
        if (settings.showOnLoad) {
          button.style.opacity = "0.8";
          button.style.visibility = "visible";
        } else {
          if (!this.plugin.isSettingsOpen) {
            checkScroll();
          }
        }
        this.plugin.registerEvent(
          this.plugin.app.workspace.on("layout-change", () => {
            setTimeout(() => {
              this.addScrollListeners(checkScroll);
              checkScroll();
            }, 100);
          })
        );
      }
      scrollToTop() {
        const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        let scrollElement = activeView.contentEl.querySelector(".cm-scroller") || activeView.contentEl.querySelector(".markdown-preview-view");
        if (scrollElement) {
          scrollElement.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
      createScrollChecker(button, settings) {
        return () => {
          const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
          if (activeView) {
            const scrollElement = activeView.contentEl.querySelector(".cm-scroller") || activeView.contentEl.querySelector(
              ".markdown-preview-view"
            );
            if (scrollElement) {
              const scrollTop = scrollElement.scrollTop;
              if (scrollTop > settings.scrollThreshold) {
                button.style.opacity = settings.buttonOpacity;
                button.style.visibility = "visible";
              } else {
                button.style.opacity = "0";
                button.style.visibility = "hidden";
              }
            }
          }
        };
      }
      addScrollListeners(checkScroll) {
        const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) return;
        const scrollElement = activeView.contentEl.querySelector(".cm-scroller") || activeView.contentEl.querySelector(".markdown-preview-view");
        if (scrollElement) {
          scrollElement.addEventListener("scroll", checkScroll);
        }
      }
      async setupMobileVisibilityObserver(button, settings) {
        if (this.plugin.isSettingsOpen) return;
        if (!this.plugin.app.isMobile) return;
        const navBar = document.querySelector(".mobile-navbar");
        if (!navBar) {
          this.plugin.logger.logWarn(
            "Could not find .mobile-navbar to observe for visibility changes."
          );
          return;
        }
        const checkScroll = this.createScrollChecker(button, settings);
        const checkRealVisibility = () => {
          const rect = navBar.getBoundingClientRect();
          const checkX = rect.left + 20;
          const checkY = rect.top + rect.height / 2;
          const topElement = document.elementFromPoint(checkX, checkY);
          const isReallyVisible = topElement === navBar || topElement && navBar.contains(topElement);
          if (!isReallyVisible) {
            button.style.opacity = "0";
            button.style.visibility = "hidden";
          } else {
            checkScroll();
          }
        };
        const visibilityInterval = setInterval(checkRealVisibility, 500);
        this.plugin.register(() => clearInterval(visibilityInterval));
      }
      async getEffectiveSettings() {
        const isMobile = this.plugin.app.isMobile;
        let effectiveSettings = {
          scrollThreshold: this.plugin.settings.scrollThreshold,
          showOnLoad: this.plugin.settings.showOnLoad,
          buttonOpacity: "1"
        };
        if (isMobile) {
          const mobileColors = await this.mobileUtils.getMobileThemeProperties();
          const mobileDetection = await this.mobileUtils.detectMobileButtonPosition();
          effectiveSettings = {
            ...effectiveSettings,
            buttonSize: mobileDetection?.size ?? this.plugin.settings.mobileButtonSize,
            fontSize: this.plugin.settings.mobileFontSize,
            bottomPosition: mobileDetection?.bottom ?? this.plugin.settings.mobileBottomPosition,
            rightPosition: mobileDetection?.right ?? this.plugin.settings.mobileRightPosition,
            buttonColor: mobileColors?.buttonColor ?? this.plugin.settings.mobileButtonColor,
            textColor: mobileColors?.textColor ?? this.plugin.settings.mobileTextColor,
            buttonOpacity: mobileColors?.buttonOpacity ?? "1"
          };
        } else {
          effectiveSettings = {
            ...effectiveSettings,
            buttonSize: this.plugin.settings.buttonSize,
            fontSize: this.plugin.settings.fontSize,
            bottomPosition: this.plugin.settings.bottomPosition,
            rightPosition: this.plugin.settings.rightPosition,
            buttonColor: this.plugin.settings.buttonColor,
            textColor: this.plugin.settings.textColor
          };
        }
        return effectiveSettings;
      }
      getDebugInfo() {
        return this.debugInfo;
      }
    };
    module2.exports = { ButtonManager: ButtonManager2 };
  }
});

// src/logger.js
var require_logger = __commonJS({
  "src/logger.js"(exports2, module2) {
    var LogLevel2 = {
      NONE: 0,
      ERROR: 1,
      WARN: 2,
      INFO: 3,
      DEBUG: 4,
      VERBOSE: 5,
      TRACE: 6
    };
    var Logger2 = class {
      constructor(plugin) {
        this.plugin = plugin;
      }
      async logTo(message, level = LogLevel2.INFO, forceConsole = false, type = "both") {
        if ((this.plugin.settings?.logLevel ?? LogLevel2.INFO) < level && !forceConsole) {
          return;
        }
        const platform = this.plugin.app?.isMobile ? "Mobile " : "Desktop";
        const timestamp = (/* @__PURE__ */ new Date()).toISOString();
        const levelName = Object.keys(LogLevel2).find((key) => LogLevel2[key] === level) || "INFO";
        const logMessage = `[${timestamp}] [${platform}] [${levelName.padEnd(7, " ")}] ${message}`;
        if (this.plugin.settings.enableDebugging || forceConsole) {
          if (type === "console" || type === "both") {
            console.log(logMessage);
          }
        }
        if (this.plugin.settings.enableDebugging && this.plugin.settings.enableFileLogging) {
          if (type === "file" || type === "both") {
            if (this.plugin.app?.vault?.adapter) {
              try {
                const adapter = this.plugin.app.vault.adapter;
                const logPath = ".obsidian/plugins/back-to-top-action-btn/debug.log";
                const logFileExists = await adapter.exists(logPath);
                if (!logFileExists) {
                  await adapter.write(
                    logPath,
                    "--- Back to Top Plugin Log Start ---\n"
                  );
                }
                await adapter.append(logPath, logMessage + "\n");
              } catch (error) {
                console.error(
                  "BackToTopPlugin: FAILED TO WRITE TO LOG FILE:",
                  error
                );
              }
            }
          }
        }
      }
      // Errors are always forced to the console
      logError(message, type = "both") {
        this.logTo(message, LogLevel2.ERROR, true, type);
      }
      logWarn(message, forceConsole = false, type = "both") {
        this.logTo(message, LogLevel2.WARN, forceConsole, type);
      }
      logInfo(message, forceConsole = false, type = "both") {
        this.logTo(message, LogLevel2.INFO, forceConsole, type);
      }
      logVerbose(message, forceConsole = false, type = "both") {
        this.logTo(message, LogLevel2.VERBOSE, forceConsole, type);
      }
      logDebug(message, forceConsole = false, type = "both") {
        this.logTo(message, LogLevel2.DEBUG, forceConsole, type);
      }
      logTrace(message, forceConsole = false, type = "both") {
        this.logTo(message, LogLevel2.TRACE, forceConsole, type);
      }
    };
    module2.exports = { Logger: Logger2, LogLevel: LogLevel2 };
  }
});

// src/settings.js
var require_settings = __commonJS({
  "src/settings.js"(exports2, module2) {
    var { PluginSettingTab, Setting } = require("obsidian");
    var { LogLevel: LogLevel2 } = require_logger();
    var DEFAULT_SETTINGS2 = {
      // General settings
      scrollThreshold: 300,
      showOnLoad: false,
      // Desktop settings
      buttonSize: "35px",
      fontSize: "30px",
      bottomPosition: "50px",
      rightPosition: "20px",
      buttonColor: "#007acc",
      textColor: "#ffffff",
      // Mobile auto adapt settings
      autoAdaptMobile: true,
      useMobileThemeColors: true,
      mobileButtonOffset: "20px",
      // Mobile manual settings
      mobileButtonSize: "40px",
      mobileFontSize: "32px",
      mobileBottomPosition: "120px",
      mobileRightPosition: "20px",
      mobileButtonColor: "#007acc",
      mobileTextColor: "#ffffff",
      // Platform specific settings
      showOtherPlatformSettings: false,
      // Debugging settings
      enableDebugging: false,
      enableFileLogging: false,
      logLevel: LogLevel2.INFO,
      autoDowngradeLevelMinutes: 5
    };
    var BackToTopSettingTab2 = class extends PluginSettingTab {
      constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
      }
      onOpen() {
        this.plugin.isSettingsOpen = true;
      }
      onClose() {
        this.plugin.isSettingsOpen = false;
        this.plugin.buttonManager.addBackToTopButton();
      }
      createMobileSettings(containerEl) {
        const isAutoAdapt = this.plugin.settings.autoAdaptMobile;
        const useThemeColors = this.plugin.settings.useMobileThemeColors;
        new Setting(containerEl).setName("Auto-adapt for mobile").setDesc(
          "Automatically position button above mobile read/edit toggle"
        ).addToggle(
          (toggle) => toggle.setValue(this.plugin.settings.autoAdaptMobile).onChange(async (value) => {
            this.plugin.settings.autoAdaptMobile = value;
            await this.plugin.saveSettings();
            this.display();
          })
        );
        const sizePositionGroup = containerEl.createEl("div");
        sizePositionGroup.style.marginLeft = "20px";
        sizePositionGroup.style.paddingLeft = "15px";
        sizePositionGroup.style.borderLeft = "3px solid var(--interactive-accent)";
        sizePositionGroup.style.marginTop = "10px";
        sizePositionGroup.style.marginBottom = "15px";
        if (isAutoAdapt) {
          this.createDisablableTextSetting(sizePositionGroup, {
            name: "Distance above mobile button",
            desc: "How far above the mobile button (pixels)",
            placeholder: "20",
            settingKey: "mobileButtonOffset",
            disabled: false
          });
        }
        this.createDisablableTextSetting(sizePositionGroup, {
          name: "Button size",
          desc: "Size of the button (pixels)",
          placeholder: "40",
          settingKey: "mobileButtonSize",
          disabled: isAutoAdapt
        });
        this.createDisablableTextSetting(sizePositionGroup, {
          name: "Arrow size",
          desc: "Size of the arrow (pixels)",
          placeholder: "32",
          settingKey: "mobileFontSize",
          disabled: isAutoAdapt
        });
        this.createDisablableTextSetting(sizePositionGroup, {
          name: "Bottom position",
          desc: "Distance from bottom of screen (pixels)",
          placeholder: "120",
          settingKey: "mobileBottomPosition",
          disabled: isAutoAdapt
        });
        this.createDisablableTextSetting(sizePositionGroup, {
          name: "Right position",
          desc: "Distance from right of screen (pixels)",
          placeholder: "20",
          settingKey: "mobileRightPosition",
          disabled: isAutoAdapt
        });
        new Setting(containerEl).setName("Use mobile theme colors").setDesc("Automatically use mobile app theme colors").addToggle(
          (toggle) => toggle.setValue(this.plugin.settings.useMobileThemeColors).onChange(async (value) => {
            this.plugin.settings.useMobileThemeColors = value;
            await this.plugin.saveSettings();
            this.display();
          })
        );
        const colorGroup = containerEl.createEl("div");
        colorGroup.style.marginLeft = "20px";
        colorGroup.style.paddingLeft = "15px";
        colorGroup.style.borderLeft = "3px solid var(--interactive-accent)";
        colorGroup.style.marginTop = "10px";
        colorGroup.style.marginBottom = "15px";
        this.createDisablableColorSetting(colorGroup, {
          name: "Button color",
          desc: "Background color",
          settingKey: "mobileButtonColor",
          disabled: useThemeColors
        });
        this.createDisablableColorSetting(colorGroup, {
          name: "Text color",
          desc: "Color of the arrow",
          settingKey: "mobileTextColor",
          disabled: useThemeColors
        });
      }
      createDesktopSettings(containerEl) {
        new Setting(containerEl).setName("Button size").setDesc("Size of the button (pixels)").addText(
          (text) => text.setPlaceholder("35").setValue(this.plugin.settings.buttonSize.replace("px", "")).onChange(async (value) => {
            this.plugin.settings.buttonSize = value + "px";
            await this.plugin.saveSettings();
          })
        );
        new Setting(containerEl).setName("Arrow size").setDesc("Size of the arrow (pixels)").addText(
          (text) => text.setPlaceholder("30").setValue(this.plugin.settings.fontSize.replace("px", "")).onChange(async (value) => {
            this.plugin.settings.fontSize = value + "px";
            await this.plugin.saveSettings();
          })
        );
        new Setting(containerEl).setName("Bottom position").setDesc("Distance from bottom of screen (pixels)").addText(
          (text) => text.setPlaceholder("50").setValue(
            this.plugin.settings.bottomPosition.replace("px", "")
          ).onChange(async (value) => {
            this.plugin.settings.bottomPosition = value + "px";
            await this.plugin.saveSettings();
          })
        );
        new Setting(containerEl).setName("Right position").setDesc("Distance from right of screen (pixels)").addText(
          (text) => text.setPlaceholder("25").setValue(
            this.plugin.settings.rightPosition.replace("px", "")
          ).onChange(async (value) => {
            this.plugin.settings.rightPosition = value + "px";
            await this.plugin.saveSettings();
          })
        );
        new Setting(containerEl).setName("Button color").setDesc("Background color of the button").addColorPicker(
          (colorPicker) => colorPicker.setValue(this.plugin.settings.buttonColor).onChange(async (value) => {
            this.plugin.settings.buttonColor = value;
            await this.plugin.saveSettings();
          })
        );
        new Setting(containerEl).setName("Text color").setDesc("Color of the arrow").addColorPicker(
          (colorPicker) => colorPicker.setValue(this.plugin.settings.textColor).onChange(async (value) => {
            this.plugin.settings.textColor = value;
            await this.plugin.saveSettings();
          })
        );
      }
      createDisablableTextSetting(container, options) {
        const setting = new Setting(container).setName(options.name).setDesc(options.desc).addText(
          (text) => text.setPlaceholder(options.placeholder).setValue(
            this.plugin.settings[options.settingKey].replace(
              "px",
              ""
            )
          ).onChange(async (value) => {
            this.plugin.settings[options.settingKey] = value + "px";
            await this.plugin.saveSettings();
          })
        );
        if (options.disabled) {
          setting.controlEl.style.opacity = "0.4";
          setting.controlEl.style.pointerEvents = "none";
          const input = setting.controlEl.querySelector("input");
          if (input) {
            input.disabled = true;
            input.style.cursor = "not-allowed";
          }
        }
        return setting;
      }
      createDisablableColorSetting(container, options) {
        const setting = new Setting(container).setName(options.name).setDesc(options.desc).addColorPicker(
          (colorPicker) => colorPicker.setValue(this.plugin.settings[options.settingKey]).onChange(async (value) => {
            this.plugin.settings[options.settingKey] = value;
            await this.plugin.saveSettings();
          })
        );
        if (options.disabled) {
          setting.controlEl.style.opacity = "0.4";
          setting.controlEl.style.pointerEvents = "none";
        }
        return setting;
      }
      display() {
        const { containerEl } = this;
        containerEl.empty();
        const isMobile = this.app.isMobile;
        const platform = isMobile ? "Mobile" : "Desktop";
        containerEl.createEl("h2", { text: "Back to Top Button Settings" });
        const infoBox = containerEl.createEl("div", {
          cls: "setting-item-info"
        });
        infoBox.createEl("div", {
          text: `${this.plugin.manifest.name} v${this.plugin.manifest.version}`
        });
        infoBox.createEl("div", { text: `Currently running on: ${platform}` });
        infoBox.style.marginBottom = "20px";
        infoBox.style.padding = "10px";
        infoBox.style.backgroundColor = "var(--background-secondary)";
        infoBox.style.borderRadius = "5px";
        containerEl.createEl("h3", { text: "Basic Settings" });
        new Setting(containerEl).setName("Scroll threshold").setDesc("Pixels to scroll before showing button").addText(
          (text) => text.setPlaceholder("300").setValue(this.plugin.settings.scrollThreshold.toString()).onChange(async (value) => {
            this.plugin.settings.scrollThreshold = parseInt(value) || 300;
            await this.plugin.saveSettings();
          })
        );
        new Setting(containerEl).setName("Show on page load").setDesc("Show button immediately when page loads").addToggle(
          (toggle) => toggle.setValue(this.plugin.settings.showOnLoad).onChange(async (value) => {
            this.plugin.settings.showOnLoad = value;
            await this.plugin.saveSettings();
          })
        );
        const createOtherPlatformSection = (title, createContent) => {
          new Setting(containerEl).setName(`Show ${title.toLowerCase()}`).addToggle(
            (toggle) => toggle.setValue(
              this.plugin.settings.showOtherPlatformSettings
            ).onChange(async (value) => {
              this.plugin.settings.showOtherPlatformSettings = value;
              await this.plugin.saveSettings();
              this.display();
            })
          );
          if (this.plugin.settings.showOtherPlatformSettings) {
            const contentEl = containerEl.createEl("div");
            contentEl.style.marginLeft = "20px";
            createContent(contentEl);
          }
        };
        if (isMobile) {
          containerEl.createEl("h3", { text: "Mobile Settings" });
          const mobileContent = containerEl.createEl("div");
          mobileContent.style.marginLeft = "20px";
          this.createMobileSettings(mobileContent);
          containerEl.createEl("h3", { text: "Desktop Settings" });
          createOtherPlatformSection(
            "Desktop Settings",
            (el) => this.createDesktopSettings(el)
          );
        } else {
          containerEl.createEl("h3", { text: "Desktop Settings" });
          const desktopContent = containerEl.createEl("div");
          desktopContent.style.marginLeft = "20px";
          this.createDesktopSettings(desktopContent);
          containerEl.createEl("h3", { text: "Mobile Settings" });
          createOtherPlatformSection(
            "Mobile Settings",
            (el) => this.createMobileSettings(el)
          );
        }
        containerEl.createEl("h3", { text: "Debug Settings" });
        new Setting(containerEl).setName("Enable debugging").setDesc("Show advanced debugging options below").addToggle(
          (toggle) => toggle.setValue(this.plugin.settings.enableDebugging).onChange(async (value) => {
            this.plugin.settings.enableDebugging = value;
            await this.plugin.saveSettings();
            this.display();
          })
        );
        if (this.plugin.settings.enableDebugging) {
          const debugContent = containerEl.createEl("div");
          debugContent.style.marginLeft = "20px";
          new Setting(debugContent).setName("Log level").setDesc("Set the level of detail for logs.").addDropdown(
            (dropdown) => dropdown.addOption(LogLevel2.ERROR.toString(), "Error").addOption(LogLevel2.WARN.toString(), "Warning").addOption(LogLevel2.INFO.toString(), "Info").addOption(LogLevel2.VERBOSE.toString(), "Verbose").addOption(LogLevel2.DEBUG.toString(), "Debug").addOption(LogLevel2.TRACE.toString(), "Trace").setValue(this.plugin.settings.logLevel.toString()).onChange(async (value) => {
              this.plugin.settings.logLevel = parseInt(value, 10);
              await this.plugin.saveSettings();
              this.display();
            })
          );
          const highLogLevels = [
            LogLevel2.VERBOSE,
            LogLevel2.DEBUG,
            LogLevel2.TRACE
          ];
          if (highLogLevels.includes(this.plugin.settings.logLevel)) {
            new Setting(debugContent).setName("Auto downgrade log level").setDesc(
              'Automatically reset log level to "Info" after a set time (minutes).'
            ).addText(
              (text) => text.setValue(
                this.plugin.settings.autoDowngradeLevelMinutes.toString()
              ).onChange(async (value) => {
                this.plugin.settings.autoDowngradeLevelMinutes = parseInt(value, 10) || 0;
                await this.plugin.saveSettings();
              })
            );
          }
          new Setting(debugContent).setName("Enable file logging").setDesc("Also write log messages to a file.").addToggle(
            (toggle) => toggle.setValue(this.plugin.settings.enableFileLogging).onChange(async (value) => {
              this.plugin.settings.enableFileLogging = value;
              await this.plugin.saveSettings();
            })
          );
          const debugInfoBox = debugContent.createEl("div", {
            cls: "setting-item-info"
          });
          debugInfoBox.innerHTML = `<strong>Debug log location:</strong><br><code>.obsidian/plugins/back-to-top-action-btn/debug.log</code>`;
          debugInfoBox.style.marginTop = "10px";
          debugInfoBox.style.padding = "10px";
          debugInfoBox.style.backgroundColor = "var(--background-secondary)";
          debugInfoBox.style.borderRadius = "5px";
          debugInfoBox.style.fontSize = "12px";
        }
        if (isMobile) {
          containerEl.createEl("h3", { text: "Debug Info" });
          const debugContent = containerEl.createEl("div");
          debugContent.style.padding = "10px";
          debugContent.style.backgroundColor = "var(--background-secondary)";
          debugContent.style.borderRadius = "5px";
          debugContent.style.fontFamily = "monospace";
          debugContent.style.fontSize = "12px";
          const debugInfo = this.plugin.buttonManager?.getDebugInfo();
          if (debugInfo) {
            debugContent.innerHTML = `
                    <strong>Plugin Status:</strong> ${debugInfo.isMobile ? "Mobile" : "Desktop"}<br>
                    <strong>Last Updated:</strong> ${debugInfo.timestamp}<br>
                    <strong>Button Size:</strong> ${debugInfo.settings?.buttonSize}<br>
                    <strong>Button Position:</strong> ${debugInfo.settings?.rightPosition} from right, ${debugInfo.settings?.bottomPosition} from bottom<br>
                    <strong>Button Colors:</strong> ${debugInfo.settings?.buttonColor} / ${debugInfo.settings?.textColor}<br>
                    <strong>Scroll Threshold:</strong> ${debugInfo.settings?.scrollThreshold}px<br>
                    ${debugInfo.scrollInfo ? `
                    <strong>Scroll Element:</strong> ${debugInfo.scrollInfo.scrollElement}<br>
                    <strong>Current Scroll:</strong> ${debugInfo.scrollInfo.scrollTop}px<br>
                    <strong>Should Show:</strong> ${debugInfo.scrollInfo.shouldShow ? "YES" : "NO"}
                    ` : "<strong>Scroll Info:</strong> Not available (scroll on a page to populate)"}
                `;
          } else {
            debugContent.innerHTML = "<strong>Debug info not available.</strong> Open a note and scroll to populate data.";
          }
          const refreshBtn = debugContent.createEl("button", {
            text: "Refresh Debug Info"
          });
          refreshBtn.style.marginTop = "10px";
          refreshBtn.onclick = () => this.display();
        }
      }
    };
    module2.exports = { BackToTopSettingTab: BackToTopSettingTab2, DEFAULT_SETTINGS: DEFAULT_SETTINGS2 };
  }
});

// src/main.js
var { Plugin } = require("obsidian");
var { ButtonManager } = require_button_manager();
var { BackToTopSettingTab, DEFAULT_SETTINGS } = require_settings();
var { Logger, LogLevel } = require_logger();
var BackToTopPlugin = class extends Plugin {
  logDowngradeTimer = null;
  isSettingsOpen = false;
  async onload() {
    try {
      this.logger = new Logger(this);
      this.buttonManager = new ButtonManager(this);
      await this.loadSettings();
      this.logger.logInfo("Loading Floating Back to Top Button plugin", true, "console");
      this.addSettingTab(new BackToTopSettingTab(this.app, this));
      this.logger.logDebug("Settings loaded and tab added successfully");
      const setupButtonForActiveView = () => {
        setTimeout(() => this.buttonManager.addBackToTopButton(), 100);
      };
      this.app.workspace.onLayoutReady(() => {
        this.logger.logVerbose("Workspace layout is ready. Setting up button for the initial view.");
        setupButtonForActiveView();
      });
      this.registerEvent(
        this.app.workspace.on("active-leaf-change", () => {
          this.logger.logInfo("Active leaf changed. Re-creating button.");
          setupButtonForActiveView();
        })
      );
      this.startLogDowngradeTimer();
      this.logger.logDebug("Event listeners registered and downgrade timer started.");
    } catch (error) {
      console.error("BackToTopPlugin: FATAL error in onload:", error);
      if (this.logger) {
        this.logger.logError(`FATAL error in onload: ${error.stack || error}`);
      }
    }
  }
  startLogDowngradeTimer() {
    if (this.logDowngradeTimer) {
      clearTimeout(this.logDowngradeTimer);
    }
    const highLogLevels = [LogLevel.VERBOSE, LogLevel.DEBUG, LogLevel.TRACE];
    const shouldDowngrade = this.settings.autoDowngradeLevelMinutes > 0 && highLogLevels.includes(this.settings.logLevel);
    if (shouldDowngrade) {
      const delayInMs = this.settings.autoDowngradeLevelMinutes * 60 * 1e3;
      this.logger.logInfo(`Log level will be auto-downgraded to INFO in ${this.settings.autoDowngradeLevelMinutes} minutes.`);
      this.logDowngradeTimer = setTimeout(() => {
        this.logger.logInfo("Auto-downgrading log level to INFO.");
        this.settings.logLevel = LogLevel.INFO;
        this.saveSettings();
      }, delayInMs);
    }
  }
  async loadSettings() {
    this.logger.logDebug("Loading settings");
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    this.logger.logDebug("Saving settings");
    await this.saveData(this.settings);
    this.buttonManager.updateButtonAppearance();
    this.startLogDowngradeTimer();
  }
  onunload() {
    this.logger.logInfo(`Unloading Floating Back to Top Button plugin`, true);
    if (this.logDowngradeTimer) {
      clearTimeout(this.logDowngradeTimer);
    }
    const button = document.querySelector(".back-to-top-btn");
    if (button) {
      button.remove();
    }
  }
};
module.exports = BackToTopPlugin;
