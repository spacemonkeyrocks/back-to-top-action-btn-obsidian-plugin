const { MarkdownView } = require('obsidian');
const { MobileUtils } = require('./mobile-utils');

class ButtonManager {
    constructor(plugin) {
        this.plugin = plugin;
        this.mobileUtils = new MobileUtils(plugin);
        this.debugInfo = {};
    }

    async updateButtonAppearance() {
        this.plugin.logger.logDebug(
            'Starting updateButtonAppearance (lightweight)'
        );
        const button = document.querySelector('.back-to-top-btn');

        if (!button) {
            this.plugin.logger.logWarn(
                'updateButtonAppearance called but no button found, running full creation.'
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
        const activeView =
            this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
            const existingButton = document.querySelector('.back-to-top-btn');
            if (existingButton) existingButton.remove();
            this.plugin.logger.logDebug(
                'Not in a markdown view, skipping addBackToTopButton'
            );
            return;
        }

        this.plugin.logger.logDebug(
            'Starting addBackToTopButton (full creation)'
        );

        this.debugInfo = {
            isMobile: this.plugin.app.isMobile,
            timestamp: new Date().toLocaleTimeString(),
        };

        const existingButton = document.querySelector('.back-to-top-btn');
        if (existingButton) {
            this.plugin.logger.logTrace('Removing existing button');
            existingButton.remove();
        }

        try {
            const settings = await this.getEffectiveSettings();
            this.debugInfo.settings = settings;

            const button = this.createButton();
            this.applyCoreStyles(button, settings);
            this.addEventListeners(button, settings);

            document.body.appendChild(button);
            this.plugin.logger.logVerbose('Button added to document body');

            await this.setupMobileVisibilityObserver(button, settings);
        } catch (error) {
            this.plugin.logger.logError(
                `ERROR in addBackToTopButton: ${error.stack || error}`
            );
        }
    }

    createButton() {
        const button = document.createElement('button');
        button.className = 'back-to-top-btn';
        button.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 3L6 9L7.5 10.5L11 7V21H13V7L16.5 10.5L18 9L12 3Z" fill="currentColor"/>
</svg>`;
        button.title = 'Back to Top';
        return button;
    }

    applyDynamicStyles(button, settings) {
        Object.assign(button.style, {
            bottom: settings.bottomPosition,
            right: settings.rightPosition,
            width: settings.buttonSize,
            height: settings.buttonSize,
            backgroundColor: settings.buttonColor,
            color: settings.textColor,
        });

        this.plugin.logger.logDebug(
            `Button styles updated: size=${settings.buttonSize}, position=${settings.rightPosition} from right, ${settings.bottomPosition} from bottom, colors=${settings.buttonColor}/${settings.textColor}`
        );
    }

    applyCoreStyles(button, settings) {
        this.applyDynamicStyles(button, settings);

        Object.assign(button.style, {
            position: 'fixed',
            borderRadius: '50%',
            border: 'none',
            fontSize: '0',
            fontWeight: 'bold',
            cursor: 'pointer',
            opacity: '0',
            visibility: 'hidden',
            transition:
                'opacity 0.3s ease, visibility 0.3s ease, transform 0.2s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1',
            zIndex: '999',
        });

        const svg = button.querySelector('svg');
        if (svg) {
            svg.style.setProperty('width', '28px', 'important');
            svg.style.setProperty('height', '28px', 'important');
            svg.style.setProperty('min-width', '28px', 'important');
            svg.style.setProperty('min-height', '28px', 'important');
        }
    }

    addEventListeners(button, settings) {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        });

        button.addEventListener('click', () => {
            this.scrollToTop();
        });

        const checkScroll = this.createScrollChecker(button, settings);
        this.addScrollListeners(checkScroll);

        if (settings.showOnLoad) {
            button.style.opacity = '0.8';
            button.style.visibility = 'visible';
        } else {
            if (!this.plugin.isSettingsOpen) {
                checkScroll();
            }
        }

        this.plugin.registerEvent(
            this.plugin.app.workspace.on('layout-change', () => {
                setTimeout(() => {
                    this.addScrollListeners(checkScroll);
                    checkScroll();
                }, 100);
            })
        );
    }

    scrollToTop() {
        const activeView =
            this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        let scrollElement =
            activeView.contentEl.querySelector('.cm-scroller') ||
            activeView.contentEl.querySelector('.markdown-preview-view');
        if (scrollElement) {
            scrollElement.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    createScrollChecker(button, settings) {
        return () => {
            const activeView =
                this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
            if (activeView) {
                const scrollElement =
                    activeView.contentEl.querySelector('.cm-scroller') ||
                    activeView.contentEl.querySelector(
                        '.markdown-preview-view'
                    );
                if (scrollElement) {
                    const scrollTop = scrollElement.scrollTop;
                    if (scrollTop > settings.scrollThreshold) {
                        button.style.opacity = settings.buttonOpacity;
                        button.style.visibility = 'visible';
                    } else {
                        button.style.opacity = '0';
                        button.style.visibility = 'hidden';
                    }
                }
            }
        };
    }

    addScrollListeners(checkScroll) {
        const activeView =
            this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) return;

        const scrollElement =
            activeView.contentEl.querySelector('.cm-scroller') ||
            activeView.contentEl.querySelector('.markdown-preview-view');
        if (scrollElement) {
            scrollElement.addEventListener('scroll', checkScroll);
        }
    }

    async setupMobileVisibilityObserver(button, settings) {
        if (this.plugin.isSettingsOpen) return;
        if (!this.plugin.app.isMobile) return;

        const navBar = document.querySelector('.mobile-navbar');
        if (!navBar) {
            this.plugin.logger.logWarn(
                'Could not find .mobile-navbar to observe for visibility changes.'
            );
            return;
        }

        const checkScroll = this.createScrollChecker(button, settings);

        const checkRealVisibility = () => {
            const rect = navBar.getBoundingClientRect();
            const checkX = rect.left + 20;
            const checkY = rect.top + rect.height / 2;
            const topElement = document.elementFromPoint(checkX, checkY);
            const isReallyVisible =
                topElement === navBar ||
                (topElement && navBar.contains(topElement));

            if (!isReallyVisible) {
                button.style.opacity = '0';
                button.style.visibility = 'hidden';
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
            buttonOpacity: '1',
        };

        if (isMobile) {
            const mobileColors =
                await this.mobileUtils.getMobileThemeProperties();
            const mobileDetection =
                await this.mobileUtils.detectMobileButtonPosition();

            effectiveSettings = {
                ...effectiveSettings,
                buttonSize:
                    mobileDetection?.size ??
                    this.plugin.settings.mobileButtonSize,
                fontSize: this.plugin.settings.mobileFontSize,
                bottomPosition:
                    mobileDetection?.bottom ??
                    this.plugin.settings.mobileBottomPosition,
                rightPosition:
                    mobileDetection?.right ??
                    this.plugin.settings.mobileRightPosition,
                buttonColor:
                    mobileColors?.buttonColor ??
                    this.plugin.settings.mobileButtonColor,
                textColor:
                    mobileColors?.textColor ??
                    this.plugin.settings.mobileTextColor,
                buttonOpacity: mobileColors?.buttonOpacity ?? '1',
            };
        } else {
            effectiveSettings = {
                ...effectiveSettings,
                buttonSize: this.plugin.settings.buttonSize,
                fontSize: this.plugin.settings.fontSize,
                bottomPosition: this.plugin.settings.bottomPosition,
                rightPosition: this.plugin.settings.rightPosition,
                buttonColor: this.plugin.settings.buttonColor,
                textColor: this.plugin.settings.textColor,
            };
        }
        return effectiveSettings;
    }

    getDebugInfo() {
        return this.debugInfo;
    }
}

module.exports = { ButtonManager };
