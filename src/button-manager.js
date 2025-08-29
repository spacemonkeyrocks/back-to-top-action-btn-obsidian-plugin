const { MarkdownView } = require('obsidian');
const { MobileUtils } = require('./mobile-utils');

class ButtonManager {
    constructor(plugin) {
        this.plugin = plugin;
        this.mobileUtils = new MobileUtils(plugin);
        this.debugInfo = {};
        this.isScrollingUp = false; // Flag to prevent scroll listener interference
    }

    _getScrollableElement(activeView) {
        if (!activeView) return null;
        this.plugin.logger.logTrace(
            '_getScrollableElement: Starting search for scrollable element.'
        );

        const contentEl = activeView.contentEl;
        let scrollElement = null;

        const previewView = contentEl.querySelector('.markdown-preview-view');
        if (previewView && previewView.offsetParent !== null) {
            if (previewView.scrollHeight > previewView.clientHeight) {
                scrollElement = previewView;
            }
        }

        if (!scrollElement) {
            const sourceScroller = contentEl.querySelector('.cm-scroller');
            if (sourceScroller) {
                if (sourceScroller.scrollHeight > sourceScroller.clientHeight) {
                    scrollElement = sourceScroller;
                }
            }
        }

        if (!scrollElement) {
            const viewContent = contentEl.querySelector('.view-content');
            if (viewContent) {
                if (viewContent.scrollHeight > viewContent.clientHeight) {
                    scrollElement = viewContent;
                }
            }
        }

        if (scrollElement) {
            this.plugin.logger.logDebug(
                `_getScrollableElement: Final element selected: ${scrollElement.className}`
            );
        } else {
            this.plugin.logger.logWarn(
                '_getScrollableElement: No scrollable element could be found.'
            );
        }

        return scrollElement;
    }

    async updateButtonAppearance() {
        this.plugin.logger.logDebug(
            'Starting updateButtonAppearance (lightweight)'
        );
        const button = document.querySelector('.back-to-top-btn');

        if (!button) {
            this.addBackToTopButton();
            return;
        }

        try {
            const settings = await this.getEffectiveSettings();
            this.applyDynamicStyles(button, settings);
            this.createScrollChecker(button, settings)();
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
            return;
        }

        this.plugin.logger.logDebug(
            'Starting addBackToTopButton (full creation)'
        );
        const existingButton = document.querySelector('.back-to-top-btn');
        if (existingButton) {
            existingButton.remove();
        }

        try {
            const settings = await this.getEffectiveSettings();
            this.debugInfo.settings = settings;
            const button = this.createButton();
            this.applyCoreStyles(button, settings);
            this.addEventListeners(button, settings);
            document.body.appendChild(button);
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
        button.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M12 3L6 9L7.5 10.5L11 7V21H13V7L16.5 10.5L18 9L12 3Z" fill="currentColor"/></svg>`;
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
        button.addEventListener(
            'mouseenter',
            () => (button.style.transform = 'scale(1.1)')
        );
        button.addEventListener(
            'mouseleave',
            () => (button.style.transform = 'scale(1)')
        );

        button.addEventListener('click', () => {
            this.plugin.logger.logDebug(
                'Button clicked. Setting isScrollingUp flag to true.'
            );
            this.isScrollingUp = true;
            this.scrollToTop();

            setTimeout(() => {
                this.plugin.logger.logDebug(
                    'Scroll animation finished. Setting isScrollingUp flag to false.'
                );
                this.isScrollingUp = false;
                this.createScrollChecker(button, settings)();
            }, 500);
        });

        const checkScroll = this.createScrollChecker(button, settings);
        setTimeout(() => {
            this.addScrollListeners(checkScroll);
            if (!settings.showOnLoad) {
                checkScroll();
            }
        }, 100);

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
        this.plugin.logger.logDebug('scrollToTop: function called.');
        const activeView =
            this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        const scrollElement = this._getScrollableElement(activeView);

        this.plugin.logger.logDebug(
            'scrollToTop: Final scroll element selected:',
            scrollElement
        );

        if (scrollElement) {
            this.plugin.logger.logDebug(
                `scrollToTop: Issuing scrollTo command to ${scrollElement.className}.`
            );
            scrollElement.scrollTo({ top: 0, behavior: 'smooth' });

            // Add the failsafe timeout for all platforms.
            setTimeout(() => {
                this.plugin.logger.logTrace(
                    'scrollToTop: Failsafe scrollTop=0 executing.'
                );
                scrollElement.scrollTop = 0;
            }, 50);
        }
    }

    createScrollChecker(button, settings) {
        return () => {
            if (this.isScrollingUp) {
                this.plugin.logger.logTrace(
                    'checkScroll: isScrollingUp is true, skipping check.'
                );
                return;
            }

            const activeView =
                this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
            const scrollElement = this._getScrollableElement(activeView);

            if (scrollElement) {
                const scrollTop = scrollElement.scrollTop;
                const shouldShow = scrollTop > settings.scrollThreshold;
                this.plugin.logger.logTrace(
                    `checkScroll: scrollTop=${scrollTop}, threshold=${settings.scrollThreshold}, shouldShow=${shouldShow}`
                );

                if (shouldShow) {
                    button.style.opacity = '0.8';
                    button.style.visibility = 'visible';
                } else {
                    button.style.opacity = '0';
                    button.style.visibility = 'hidden';
                }
            }
        };
    }

    addScrollListeners(checkScroll) {
        this.plugin.logger.logTrace('addScrollListeners called.');
        const activeView =
            this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
        const scrollElement = this._getScrollableElement(activeView);

        if (scrollElement) {
            this.plugin.logger.logDebug(
                `Attaching scroll listener to: ${scrollElement.className}`
            );
            scrollElement.addEventListener('scroll', checkScroll);
        }
    }

    async setupMobileVisibilityObserver(button, settings) {
        if (this.plugin.isSettingsOpen) return;
        if (!this.plugin.app.isMobile) return;

        const navBar = document.querySelector('.mobile-navbar');
        if (!navBar) return;

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
        let settings = {
            scrollThreshold: this.plugin.settings.scrollThreshold,
            showOnLoad: this.plugin.settings.showOnLoad,
        };

        if (isMobile) {
            const mobileColors =
                await this.mobileUtils.getMobileThemeProperties();
            const mobileDetection =
                await this.mobileUtils.detectMobileButtonPosition();
            Object.assign(settings, {
                buttonSize:
                    mobileDetection?.size ??
                    this.plugin.settings.mobileButtonSize,
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
            });
        } else {
            Object.assign(settings, {
                buttonSize: this.plugin.settings.buttonSize,
                bottomPosition: this.plugin.settings.bottomPosition,
                rightPosition: this.plugin.settings.rightPosition,
                buttonColor: this.plugin.settings.buttonColor,
                textColor: this.plugin.settings.textColor,
                buttonOpacity: '1',
            });
        }
        return settings;
    }

    getDebugInfo() {
        return this.debugInfo;
    }
}

module.exports = { ButtonManager };
