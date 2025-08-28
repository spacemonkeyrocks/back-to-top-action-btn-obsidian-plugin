const LogLevel = {
    NONE: 0,
    ERROR: 1,
    WARN: 2,
    INFO: 3,
    DEBUG: 4,
    VERBOSE: 5,
    TRACE: 6,
};

class Logger {
    constructor(plugin) {
        this.plugin = plugin;
    }

    async logTo(
        message,
        level = LogLevel.INFO,
        forceConsole = false,
        type = 'both'
    ) {
        if (
            (this.plugin.settings?.logLevel ?? LogLevel.INFO) < level &&
            !forceConsole
        ) {
            return; // Skip logging if the level is too high
        }

        // Handle case where app is not yet initialized
        const platform = this.plugin.app?.isMobile ? 'Mobile ' : 'Desktop';
        const timestamp = new Date().toISOString();
        const levelName =
            Object.keys(LogLevel).find((key) => LogLevel[key] === level) ||
            'INFO';

        const logMessage = `[${timestamp}] [${platform}] [${levelName.padEnd(7, ' ')}] ${message}`;

        // Log to console if debugging is on, or if forced (for errors)
        if (this.plugin.settings.enableDebugging || forceConsole) {
            if (type === 'console' || type === 'both') {
                console.log(logMessage);
            }
        }

        // Log to file ONLY if debugging AND file logging are both enabled
        if (
            this.plugin.settings.enableDebugging &&
            this.plugin.settings.enableFileLogging
        ) {
            if (type === 'file' || type === 'both') {
                if (this.plugin.app?.vault?.adapter) {
                    try {
                        const adapter = this.plugin.app.vault.adapter;
                        const logPath =
                            '.obsidian/plugins/back-to-top-action-btn/debug.log';
                        const logFileExists = await adapter.exists(logPath);
                        if (!logFileExists) {
                            // Create the file with a header if it's new
                            await adapter.write(
                                logPath,
                                '--- Back to Top Plugin Log Start ---\n'
                            );
                        }
                        await adapter.append(logPath, logMessage + '\n');
                    } catch (error) {
                        console.error(
                            'BackToTopPlugin: FAILED TO WRITE TO LOG FILE:',
                            error
                        );
                    }
                }
            }
        }
    }

    // Errors are always forced to the console
    logError(message, type = 'both') {
        this.logTo(message, LogLevel.ERROR, true, type);
    }

    logWarn(message, forceConsole = false, type = 'both') {
        this.logTo(message, LogLevel.WARN, forceConsole, type);
    }

    logInfo(message, forceConsole = false, type = 'both') {
        this.logTo(message, LogLevel.INFO, forceConsole, type);
    }

    logVerbose(message, forceConsole = false, type = 'both') {
        this.logTo(message, LogLevel.VERBOSE, forceConsole, type);
    }

    logDebug(message, forceConsole = false, type = 'both') {
        this.logTo(message, LogLevel.DEBUG, forceConsole, type);
    }

    logTrace(message, forceConsole = false, type = 'both') {
        this.logTo(message, LogLevel.TRACE, forceConsole, type);
    }
}

module.exports = { Logger, LogLevel };
