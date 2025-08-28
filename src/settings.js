const { PluginSettingTab, Setting } = require('obsidian');
const { LogLevel } = require('./logger');

const DEFAULT_SETTINGS = {
    // General settings
    scrollThreshold: 300,
    showOnLoad: false,
    // Desktop settings
    buttonSize: '35px',
    fontSize: '30px',
    bottomPosition: '50px',
    rightPosition: '20px',
    buttonColor: '#007acc',
    textColor: '#ffffff',
    // Mobile auto adapt settings
    autoAdaptMobile: true,
    useMobileThemeColors: true,
    mobileButtonOffset: '20px',
    // Mobile manual settings
    mobileButtonSize: '40px',
    mobileFontSize: '32px',
    mobileBottomPosition: '120px',
    mobileRightPosition: '20px',
    mobileButtonColor: '#007acc',
    mobileTextColor: '#ffffff',
    // Platform specific settings
    showOtherPlatformSettings: false,
    // Debugging settings
    enableDebugging: false,
    enableFileLogging: false,
    logLevel: LogLevel.INFO,
    autoDowngradeLevelMinutes: 5,
};

class BackToTopSettingTab extends PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    onOpen() {
        this.plugin.isSettingsOpen = true;
    }

    onClose() {
        this.plugin.isSettingsOpen = false;
        // Re-create the button to ensure it's in the correct state after settings are closed
        this.plugin.buttonManager.addBackToTopButton();
    }

    createMobileSettings(containerEl) {
        const isAutoAdapt = this.plugin.settings.autoAdaptMobile;
        const useThemeColors = this.plugin.settings.useMobileThemeColors;

        new Setting(containerEl)
            .setName('Auto-adapt for mobile')
            .setDesc(
                'Automatically position button above mobile read/edit toggle'
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.autoAdaptMobile)
                    .onChange(async (value) => {
                        this.plugin.settings.autoAdaptMobile = value;
                        await this.plugin.saveSettings();
                        this.display();
                    })
            );

        const sizePositionGroup = containerEl.createEl('div');
        sizePositionGroup.style.marginLeft = '20px';
        sizePositionGroup.style.paddingLeft = '15px';
        sizePositionGroup.style.borderLeft =
            '3px solid var(--interactive-accent)';
        sizePositionGroup.style.marginTop = '10px';
        sizePositionGroup.style.marginBottom = '15px';

        if (isAutoAdapt) {
            this.createDisablableTextSetting(sizePositionGroup, {
                name: 'Distance above mobile button',
                desc: 'How far above the mobile button (pixels)',
                placeholder: '20',
                settingKey: 'mobileButtonOffset',
                disabled: false,
            });
        }

        this.createDisablableTextSetting(sizePositionGroup, {
            name: 'Button size',
            desc: 'Size of the button (pixels)',
            placeholder: '40',
            settingKey: 'mobileButtonSize',
            disabled: isAutoAdapt,
        });

        this.createDisablableTextSetting(sizePositionGroup, {
            name: 'Arrow size',
            desc: 'Size of the arrow (pixels)',
            placeholder: '32',
            settingKey: 'mobileFontSize',
            disabled: isAutoAdapt,
        });

        this.createDisablableTextSetting(sizePositionGroup, {
            name: 'Bottom position',
            desc: 'Distance from bottom of screen (pixels)',
            placeholder: '120',
            settingKey: 'mobileBottomPosition',
            disabled: isAutoAdapt,
        });

        this.createDisablableTextSetting(sizePositionGroup, {
            name: 'Right position',
            desc: 'Distance from right of screen (pixels)',
            placeholder: '20',
            settingKey: 'mobileRightPosition',
            disabled: isAutoAdapt,
        });

        new Setting(containerEl)
            .setName('Use mobile theme colors')
            .setDesc('Automatically use mobile app theme colors')
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.useMobileThemeColors)
                    .onChange(async (value) => {
                        this.plugin.settings.useMobileThemeColors = value;
                        await this.plugin.saveSettings();
                        this.display();
                    })
            );

        const colorGroup = containerEl.createEl('div');
        colorGroup.style.marginLeft = '20px';
        colorGroup.style.paddingLeft = '15px';
        colorGroup.style.borderLeft = '3px solid var(--interactive-accent)';
        colorGroup.style.marginTop = '10px';
        colorGroup.style.marginBottom = '15px';

        this.createDisablableColorSetting(colorGroup, {
            name: 'Button color',
            desc: 'Background color',
            settingKey: 'mobileButtonColor',
            disabled: useThemeColors,
        });

        this.createDisablableColorSetting(colorGroup, {
            name: 'Text color',
            desc: 'Color of the arrow',
            settingKey: 'mobileTextColor',
            disabled: useThemeColors,
        });
    }

    createDesktopSettings(containerEl) {
        new Setting(containerEl)
            .setName('Button size')
            .setDesc('Size of the button (pixels)')
            .addText((text) =>
                text
                    .setPlaceholder('35')
                    .setValue(this.plugin.settings.buttonSize.replace('px', ''))
                    .onChange(async (value) => {
                        this.plugin.settings.buttonSize = value + 'px';
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Arrow size')
            .setDesc('Size of the arrow (pixels)')
            .addText((text) =>
                text
                    .setPlaceholder('30')
                    .setValue(this.plugin.settings.fontSize.replace('px', ''))
                    .onChange(async (value) => {
                        this.plugin.settings.fontSize = value + 'px';
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Bottom position')
            .setDesc('Distance from bottom of screen (pixels)')
            .addText((text) =>
                text
                    .setPlaceholder('50')
                    .setValue(
                        this.plugin.settings.bottomPosition.replace('px', '')
                    )
                    .onChange(async (value) => {
                        this.plugin.settings.bottomPosition = value + 'px';
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Right position')
            .setDesc('Distance from right of screen (pixels)')
            .addText((text) =>
                text
                    .setPlaceholder('25')
                    .setValue(
                        this.plugin.settings.rightPosition.replace('px', '')
                    )
                    .onChange(async (value) => {
                        this.plugin.settings.rightPosition = value + 'px';
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Button color')
            .setDesc('Background color of the button')
            .addColorPicker((colorPicker) =>
                colorPicker
                    .setValue(this.plugin.settings.buttonColor)
                    .onChange(async (value) => {
                        this.plugin.settings.buttonColor = value;
                        await this.plugin.saveSettings();
                    })
            );

        new Setting(containerEl)
            .setName('Text color')
            .setDesc('Color of the arrow')
            .addColorPicker((colorPicker) =>
                colorPicker
                    .setValue(this.plugin.settings.textColor)
                    .onChange(async (value) => {
                        this.plugin.settings.textColor = value;
                        await this.plugin.saveSettings();
                    })
            );
    }

    createDisablableTextSetting(container, options) {
        const setting = new Setting(container)
            .setName(options.name)
            .setDesc(options.desc)
            .addText((text) =>
                text
                    .setPlaceholder(options.placeholder)
                    .setValue(
                        this.plugin.settings[options.settingKey].replace(
                            'px',
                            ''
                        )
                    )
                    .onChange(async (value) => {
                        this.plugin.settings[options.settingKey] = value + 'px';
                        await this.plugin.saveSettings();
                    })
            );

        if (options.disabled) {
            setting.controlEl.style.opacity = '0.4';
            setting.controlEl.style.pointerEvents = 'none';
            const input = setting.controlEl.querySelector('input');
            if (input) {
                input.disabled = true;
                input.style.cursor = 'not-allowed';
            }
        }
        return setting;
    }

    createDisablableColorSetting(container, options) {
        const setting = new Setting(container)
            .setName(options.name)
            .setDesc(options.desc)
            .addColorPicker((colorPicker) =>
                colorPicker
                    .setValue(this.plugin.settings[options.settingKey])
                    .onChange(async (value) => {
                        this.plugin.settings[options.settingKey] = value;
                        await this.plugin.saveSettings();
                    })
            );
        if (options.disabled) {
            setting.controlEl.style.opacity = '0.4';
            setting.controlEl.style.pointerEvents = 'none';
        }
        return setting;
    }

    display() {
        const { containerEl } = this;
        containerEl.empty();
        const isMobile = this.app.isMobile;
        const platform = isMobile ? 'Mobile' : 'Desktop';

        containerEl.createEl('h2', { text: 'Back to Top Button Settings' });

        const infoBox = containerEl.createEl('div', {
            cls: 'setting-item-info',
        });
        infoBox.createEl('div', {
            text: `${this.plugin.manifest.name} v${this.plugin.manifest.version}`,
        });
        infoBox.createEl('div', { text: `Currently running on: ${platform}` });
        infoBox.style.marginBottom = '20px';
        infoBox.style.padding = '10px';
        infoBox.style.backgroundColor = 'var(--background-secondary)';
        infoBox.style.borderRadius = '5px';

        containerEl.createEl('h3', { text: 'Basic Settings' });
        new Setting(containerEl)
            .setName('Scroll threshold')
            .setDesc('Pixels to scroll before showing button')
            .addText((text) =>
                text
                    .setPlaceholder('300')
                    .setValue(this.plugin.settings.scrollThreshold.toString())
                    .onChange(async (value) => {
                        this.plugin.settings.scrollThreshold =
                            parseInt(value) || 300;
                        await this.plugin.saveSettings();
                    })
            );
        new Setting(containerEl)
            .setName('Show on page load')
            .setDesc('Show button immediately when page loads')
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.showOnLoad)
                    .onChange(async (value) => {
                        this.plugin.settings.showOnLoad = value;
                        await this.plugin.saveSettings();
                    })
            );

        const createOtherPlatformSection = (title, createContent) => {
            new Setting(containerEl)
                .setName(`Show ${title.toLowerCase()}`)
                .addToggle((toggle) =>
                    toggle
                        .setValue(
                            this.plugin.settings.showOtherPlatformSettings
                        )
                        .onChange(async (value) => {
                            this.plugin.settings.showOtherPlatformSettings =
                                value;
                            await this.plugin.saveSettings();
                            this.display();
                        })
                );
            if (this.plugin.settings.showOtherPlatformSettings) {
                const contentEl = containerEl.createEl('div');
                contentEl.style.marginLeft = '20px';
                createContent(contentEl);
            }
        };

        if (isMobile) {
            containerEl.createEl('h3', { text: 'Mobile Settings' });
            const mobileContent = containerEl.createEl('div');
            mobileContent.style.marginLeft = '20px';
            this.createMobileSettings(mobileContent);

            containerEl.createEl('h3', { text: 'Desktop Settings' });
            createOtherPlatformSection('Desktop Settings', (el) =>
                this.createDesktopSettings(el)
            );
        } else {
            containerEl.createEl('h3', { text: 'Desktop Settings' });
            const desktopContent = containerEl.createEl('div');
            desktopContent.style.marginLeft = '20px';
            this.createDesktopSettings(desktopContent);

            containerEl.createEl('h3', { text: 'Mobile Settings' });
            createOtherPlatformSection('Mobile Settings', (el) =>
                this.createMobileSettings(el)
            );
        }

        containerEl.createEl('h3', { text: 'Debug Settings' });
        new Setting(containerEl)
            .setName('Enable debugging')
            .setDesc('Show advanced debugging options below')
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.enableDebugging)
                    .onChange(async (value) => {
                        this.plugin.settings.enableDebugging = value;
                        await this.plugin.saveSettings();
                        this.display();
                    })
            );

        if (this.plugin.settings.enableDebugging) {
            const debugContent = containerEl.createEl('div');
            debugContent.style.marginLeft = '20px';

            new Setting(debugContent)
                .setName('Log level')
                .setDesc('Set the level of detail for logs.')
                .addDropdown((dropdown) =>
                    dropdown
                        .addOption(LogLevel.ERROR.toString(), 'Error')
                        .addOption(LogLevel.WARN.toString(), 'Warning')
                        .addOption(LogLevel.INFO.toString(), 'Info')
                        .addOption(LogLevel.VERBOSE.toString(), 'Verbose')
                        .addOption(LogLevel.DEBUG.toString(), 'Debug')
                        .addOption(LogLevel.TRACE.toString(), 'Trace')
                        .setValue(this.plugin.settings.logLevel.toString())
                        .onChange(async (value) => {
                            this.plugin.settings.logLevel = parseInt(value, 10);
                            await this.plugin.saveSettings();
                            this.display();
                        })
                );

            const highLogLevels = [
                LogLevel.VERBOSE,
                LogLevel.DEBUG,
                LogLevel.TRACE,
            ];
            if (highLogLevels.includes(this.plugin.settings.logLevel)) {
                new Setting(debugContent)
                    .setName('Auto downgrade log level')
                    .setDesc(
                        'Automatically reset log level to "Info" after a set time (minutes).'
                    )
                    .addText((text) =>
                        text
                            .setValue(
                                this.plugin.settings.autoDowngradeLevelMinutes.toString()
                            )
                            .onChange(async (value) => {
                                this.plugin.settings.autoDowngradeLevelMinutes =
                                    parseInt(value, 10) || 0;
                                await this.plugin.saveSettings();
                            })
                    );
            }
            new Setting(debugContent)
                .setName('Enable file logging')
                .setDesc('Also write log messages to a file.')
                .addToggle((toggle) =>
                    toggle
                        .setValue(this.plugin.settings.enableFileLogging)
                        .onChange(async (value) => {
                            this.plugin.settings.enableFileLogging = value;
                            await this.plugin.saveSettings();
                        })
                );
            const debugInfoBox = debugContent.createEl('div', {
                cls: 'setting-item-info',
            });
            debugInfoBox.innerHTML = `<strong>Debug log location:</strong><br><code>.obsidian/plugins/back-to-top-action-btn/debug.log</code>`;
            debugInfoBox.style.marginTop = '10px';
            debugInfoBox.style.padding = '10px';
            debugInfoBox.style.backgroundColor = 'var(--background-secondary)';
            debugInfoBox.style.borderRadius = '5px';
            debugInfoBox.style.fontSize = '12px';
        }

        if (isMobile) {
            containerEl.createEl('h3', { text: 'Debug Info' });
            const debugContent = containerEl.createEl('div');
            debugContent.style.padding = '10px';
            debugContent.style.backgroundColor = 'var(--background-secondary)';
            debugContent.style.borderRadius = '5px';
            debugContent.style.fontFamily = 'monospace';
            debugContent.style.fontSize = '12px';

            const debugInfo = this.plugin.buttonManager?.getDebugInfo();
            if (debugInfo) {
                debugContent.innerHTML = `
                    <strong>Plugin Status:</strong> ${debugInfo.isMobile ? 'Mobile' : 'Desktop'}<br>
                    <strong>Last Updated:</strong> ${debugInfo.timestamp}<br>
                    <strong>Button Size:</strong> ${debugInfo.settings?.buttonSize}<br>
                    <strong>Button Position:</strong> ${debugInfo.settings?.rightPosition} from right, ${debugInfo.settings?.bottomPosition} from bottom<br>
                    <strong>Button Colors:</strong> ${debugInfo.settings?.buttonColor} / ${debugInfo.settings?.textColor}<br>
                    <strong>Scroll Threshold:</strong> ${debugInfo.settings?.scrollThreshold}px<br>
                    ${
                        debugInfo.scrollInfo
                            ? `
                    <strong>Scroll Element:</strong> ${debugInfo.scrollInfo.scrollElement}<br>
                    <strong>Current Scroll:</strong> ${debugInfo.scrollInfo.scrollTop}px<br>
                    <strong>Should Show:</strong> ${debugInfo.scrollInfo.shouldShow ? 'YES' : 'NO'}
                    `
                            : '<strong>Scroll Info:</strong> Not available (scroll on a page to populate)'
                    }
                `;
            } else {
                debugContent.innerHTML =
                    '<strong>Debug info not available.</strong> Open a note and scroll to populate data.';
            }

            const refreshBtn = debugContent.createEl('button', {
                text: 'Refresh Debug Info',
            });
            refreshBtn.style.marginTop = '10px';
            refreshBtn.onclick = () => this.display();
        }
    }
}

module.exports = { BackToTopSettingTab, DEFAULT_SETTINGS };
