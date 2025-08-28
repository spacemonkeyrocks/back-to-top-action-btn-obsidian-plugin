const { Plugin } = require('obsidian');
const { ButtonManager } = require('./button-manager');
const { BackToTopSettingTab, DEFAULT_SETTINGS } = require('./settings');
const { Logger, LogLevel } = require('./logger');

class BackToTopPlugin extends Plugin {
    logDowngradeTimer = null;
    isSettingsOpen = false;

    async onload() {
        try {
            // Initialize components
            this.logger = new Logger(this);
            this.buttonManager = new ButtonManager(this);

            // FIX: Load settings BEFORE the first log message
            await this.loadSettings();
            
            // Now it's safe to log
            this.logger.logInfo("Loading Floating Back to Top Button plugin", true, 'console');
            
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
                this.app.workspace.on('active-leaf-change', () => {
                    this.logger.logInfo("Active leaf changed. Re-creating button.");
                    setupButtonForActiveView();
                })
            );

            // Start the timer after everything is set up
            this.startLogDowngradeTimer();
            this.logger.logDebug("Event listeners registered and downgrade timer started.");

        } catch (error) {
            // Use console.error here as a fallback in case the logger itself has an issue
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
        const shouldDowngrade = this.settings.autoDowngradeLevelMinutes > 0 && 
                                highLogLevels.includes(this.settings.logLevel);

        if (shouldDowngrade) {
            const delayInMs = this.settings.autoDowngradeLevelMinutes * 60 * 1000;
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
        // Call the new lightweight update function instead of the heavy recreation function
        this.buttonManager.updateButtonAppearance();
        this.startLogDowngradeTimer();
    }

    onunload() {
        this.logger.logInfo(`Unloading Floating Back to Top Button plugin`, true);

        if (this.logDowngradeTimer) {
            clearTimeout(this.logDowngradeTimer);
        }
        
        const button = document.querySelector('.back-to-top-btn');
        if (button) {
            button.remove();
        }
    }
}

module.exports = BackToTopPlugin;