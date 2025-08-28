class MobileUtils {
    constructor(plugin) {
        this.plugin = plugin;
    }

    async findMobileButtonElement() {
        this.plugin.logger.logDebug(
            'Attempting to find mobile button element...'
        );

        const selectors = [
            '.view-actions .view-action[aria-label*="Current view"]', // Target the specific button
        ];

        const maxAttempts = 10;
        const intervalTime = 50;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            for (const selector of selectors) {
                this.plugin.logger.logTrace(`Checking selector "${selector}"`);
                const elements = document.querySelectorAll(selector);

                for (const element of elements) {
                    const rect = element.getBoundingClientRect();

                    // Check for actual rendered button (not the zero-size duplicates)
                    if (rect.width > 0 && rect.height > 0) {
                        // Ensure it's in the bottom area of screen (floating button)
                        if (rect.top > window.innerHeight / 2) {
                            this.plugin.logger.logVerbose(
                                `✓ Found valid mobile button: ${rect.width}x${rect.height} at ${rect.left},${rect.top}`
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
            '✗ No mobile button found with any valid selector.'
        );
        return null;
    }

    async findMobileButtonElementDebug() {
        this.plugin.logger.logDebug(
            'Attempting to find mobile button element...'
        );

        const selectors = [
            '.view-actions .view-action[aria-label*="Current view"]',
            '.floating-action-btn',
            '.mod-cta .clickable-icon',
            '.mobile-toolbar .clickable-icon',
            '.view-actions .view-action',
        ];

        // Add comprehensive debugging
        this.plugin.logger.logDebug('=== DEBUGGING ALL MATCHING ELEMENTS ===');

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
                    `  - aria-label: ${element.getAttribute('aria-label')}`
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
                    `  - offsetParent: ${element.offsetParent ? element.offsetParent.tagName : 'null'}`
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

        // Also check for any button in the bottom area
        this.plugin.logger.logDebug('=== ALL BUTTONS IN BOTTOM HALF ===');
        const allButtons = document.querySelectorAll('button, .clickable-icon');
        allButtons.forEach((button, index) => {
            const rect = button.getBoundingClientRect();
            if (rect.top > window.innerHeight / 2) {
                this.plugin.logger.logDebug(
                    `Bottom button ${index}: ${button.className}, ${rect.width}x${rect.height} at ${rect.left},${rect.top}`
                );
            }
        });

        return null; // Return null for now to just get debug info
    }

    async getMobileThemeProperties() {
        this.plugin.logger.logDebug('Get mobile theme properties');
        if (
            this.plugin.app.isMobile &&
            this.plugin.settings.useMobileThemeColors
        ) {
            const element = await this.findMobileButtonElement();
            if (element) {
                const style = getComputedStyle(element);
                const buttonColor = [
                    style.backgroundColor,
                    style.getPropertyValue('--interactive-accent'),
                    style.getPropertyValue('--color-accent'),
                ].find(
                    (c) =>
                        c &&
                        c !== 'rgba(0, 0, 0, 0)' &&
                        c !== 'transparent' &&
                        c.trim() !== ''
                );

                if (buttonColor) {
                    const textColor = [
                        style.color,
                        style.getPropertyValue('--text-on-accent'),
                        style.getPropertyValue('--text-normal'),
                        '#ffffff',
                    ].find((c) => c && c.trim() !== '');

                    // ADD THIS LINE to get the opacity
                    const buttonOpacity = style.opacity || '1';

                    this.plugin.logger.logVerbose(
                        `Found valid properties from element`
                    );
                    // UPDATE THE RETURN VALUE to include opacity
                    return { buttonColor, textColor, buttonOpacity };
                }
            }
        }
        return null;
    }

    async detectMobileButtonPosition() {
        this.plugin.logger.logDebug('Detect mobile button position');

        if (this.plugin.app.isMobile && this.plugin.settings.autoAdaptMobile) {
            const mobileButton = await this.findMobileButtonElement();
            if (mobileButton) {
                const rect = mobileButton.getBoundingClientRect();
                const buttonSize =
                    Math.round(Math.max(rect.width, rect.height)) + 'px';
                const offsetPx = parseInt(
                    this.plugin.settings.mobileButtonOffset.replace('px', '')
                );
                const bottomPos =
                    window.innerHeight - rect.top + offsetPx + 'px';
                const rightPos = window.innerWidth - rect.right + 'px';

                const detectionInfo = {
                    selector: mobileButton.className,
                    originalRect: `${rect.left}, ${rect.top}, ${rect.width}x${rect.height}`,
                    calculatedPosition: `${rightPos} from right, ${bottomPos} from bottom`,
                    detectedSize: buttonSize,
                };

                return {
                    bottom: bottomPos,
                    right: rightPos,
                    size: buttonSize,
                    detectionInfo,
                };
            }
        }
        return null;
    }
}

module.exports = { MobileUtils };
