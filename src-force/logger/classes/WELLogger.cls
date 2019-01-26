public with sharing class WELLogger {
    private static final Map<String, LoggingLevel> SYSTEM_LOGGING_LEVELS;
    @TestVisible
    private static final Map<String, LoggerSetting> LOGGER_SETTING_CACHE;
    private static final Map<String, ILogger> LOGGER_CACHE;
    private static final List<Log> LOG_CACHE_DATABASE;
    private static final List<Log> LOG_CACHE_API;

    private static final String LOGGER_NAME_DEFAULT = 'default';
    private static final String LOGGER_NAME_MAIN = 'main';
    private static final LoggerSetting DEFAULT_LOGGER_SETTING;
    private static final ILogger MAIN_LOGGER;

    private static Integer savedLogIndex;

    static {
        SYSTEM_LOGGING_LEVELS = new Map<String, LoggingLevel>();
        LOGGER_SETTING_CACHE = new Map<String, LoggerSetting>();
        LOGGER_CACHE = new Map<String, Logger>();
        LOG_CACHE_DATABASE = new List<Log>();
        LOG_CACHE_API = new List<Log>();
        savedLogIndex = 0;

        loadLoggingLevelMap();
        loadLoggerSettings();

        if (LOGGER_SETTING_CACHE.containsKey(LOGGER_NAME_DEFAULT)) {
            DEFAULT_LOGGER_SETTING = LOGGER_SETTING_CACHE.get(LOGGER_NAME_DEFAULT);
        } else {
            DEFAULT_LOGGER_SETTING = new LoggerSetting();
            DEFAULT_LOGGER_SETTING.loggingLevelDatabase = LoggingLevel.NONE;
            DEFAULT_LOGGER_SETTING.loggingLevelDebug = LoggingLevel.DEBUG;
            DEFAULT_LOGGER_SETTING.loggingLevelAPI = LoggingLevel.NONE;
            DEFAULT_LOGGER_SETTING.enabled = true;
        }

        if (!LOGGER_SETTING_CACHE.containsKey(LOGGER_NAME_MAIN)) {
            LOGGER_SETTING_CACHE.put(LOGGER_NAME_MAIN, DEFAULT_LOGGER_SETTING);
        }

        MAIN_LOGGER = get(LOGGER_NAME_MAIN);
    }

    private static void loadLoggingLevelMap() {
        for (LoggingLevel enumValue : LoggingLevel.values()) {
            SYSTEM_LOGGING_LEVELS.put(String.valueOf(enumValue).toUpperCase(), enumValue);
        }
    }

    private static void loadLoggerSettings() {
        for (WELLogSetting__mdt setting : [
            SELECT
                MasterLabel,
                Enabled__c,
                Logging_Level_Database__c,
                Logging_Level_Debug__c,
                Logging_Level_API__c
            FROM WELLogSetting__mdt
        ]) {
            LOGGER_SETTING_CACHE.put(setting.MasterLabel, new LoggerSetting(setting));
        }
    }

    private WELLogger() {}

    public static ILogger get(String name) {
        if (LOGGER_CACHE.containsKey(name)) {
            return LOGGER_CACHE.get(name);
        }

        return get(name, new Logger());
    }

    public static ILogger get(String name, Type className) {
        if (LOGGER_CACHE.containsKey(name)) {
            return LOGGER_CACHE.get(name);
        }

        if (className == null) {
            return MAIN_LOGGER;
        }

        Object newLogger = className.newInstance();
        if (newLogger instanceOf Logger) {
            return get(name, (Logger)newLogger);
        } else {
            return MAIN_LOGGER;
        }
    }

    private static ILogger get(String namespace, Logger newLogger) {
        if (namespace == null) {
            return MAIN_LOGGER;
        }

        LoggerSetting setting = LOGGER_SETTING_CACHE.get(namespace.substringBefore(':'));
        if (setting == null) {
            setting = DEFAULT_LOGGER_SETTING;
        }

        newLogger.namespace = namespace;
        newLogger.setting = setting;
        LOGGER_CACHE.put(namespace, newLogger);
        return newLogger;
    }

    public static void debug(Object message) {
        MAIN_LOGGER.debug(LoggingLevel.DEBUG, message);
    }

    public static void debug(LoggingLevel logLvl, Object message) {
        MAIN_LOGGER.debug(logLvl, message);
    }

    public static void debug(String message, Object trace) {
        MAIN_LOGGER.debug(LoggingLevel.DEBUG, message, trace);
    }

    public static void debug(LoggingLevel logLvl, String message, Object trace) {
        MAIN_LOGGER.debug(logLvl, message, trace);
    }

    public static List<Log> logs {
        get {
            return LOG_CACHE_API;
        }
    }

    public static void save() {
        if (LOG_CACHE_DATABASE.SIZE() > savedLogIndex) {
            List<WELLog__c> logs = new List<WELLog__c>();
            Log log;
            for (Integer i = savedLogIndex; i < LOG_CACHE_DATABASE.SIZE(); ++i) {
                log = LOG_CACHE_DATABASE[i];
                logs.add(new WELLog__c(
                    Level__c = log.lvl,
                    Namespace__c = log.nsp,
                    Timestamp__c = log.tst,
                    Message__c = log.msg + '\r\n' + String.valueOf(log.trc)
                ));
            }
            DATABASE.insert(logs);
            savedLogIndex = LOG_CACHE_DATABASE.size();
        }
    }

    public class LoggerSetting {
        public LoggingLevel loggingLevelDatabase { get; set; }
        public LoggingLevel loggingLevelDebug { get; set; }
        public LoggingLevel loggingLevelAPI { get; set; }
        public Boolean enabled { get; set; }

        public LoggerSetting() {

        }

        public LoggerSetting(WELLogSetting__mdt setting) {
            enabled = setting.Enabled__c;
            if (enabled) {
                loggingLevelDatabase = SYSTEM_LOGGING_LEVELS.get(setting.Logging_Level_Database__c);
                loggingLevelDebug = SYSTEM_LOGGING_LEVELS.get(setting.Logging_Level_Debug__c);
                loggingLevelAPI = SYSTEM_LOGGING_LEVELS.get(setting.Logging_Level_API__c);
            } else {
                loggingLevelDatabase = LoggingLevel.NONE;
                loggingLevelDebug = LoggingLevel.NONE;
                loggingLevelAPI = LoggingLevel.NONE;
            }
        }
    }

    public interface LoggerInterface {
        ILogger get(String name);
        void debug(Object message);
        void debug(LoggingLevel logLvl, Object message);
        void debug(String message, Object trace);
        void debug(LoggingLevel logLvl, String message, Object trace);
    }

    public interface ILogger extends LoggerInterface  {

    }

    public virtual class Logger implements ILogger {
        @TestVisible
        protected LoggerSetting setting;
        @TestVisible
        protected String namespace;

        public ILogger get(String name) {
            String namespace = this.namespace + ':' + name;
            if (LOGGER_CACHE.containsKey(namespace)) {
                return LOGGER_CACHE.get(namespace);
            }
            Logger logger = this.clone();
            logger.namespace = namespace;
            return logger;
        }

        public void debug(Object message) {
            this.internalDebug(LoggingLevel.DEBUG, message, null);
        }

        public void debug(LoggingLevel logLvl, Object message) {
            this.internalDebug(logLvl, message, null);
        }

        public void debug(String message, Object trace) {
            this.internalDebug(LoggingLevel.DEBUG, message, trace);
        }

        public void debug(LoggingLevel logLvl, String message, Object trace) {
            this.internalDebug(logLvl, message, trace);
        }

        protected virtual void internalDebug(LoggingLevel logLvl, Object message, Object trace) {
            if (!this.setting.enabled) {
                System.debug(logLvl, message + '\r\n' + trace);
                return;
            }

            Log log = new Log(logLvl, this.namespace, message, trace);
            if (this.setting.loggingLevelDatabase != LoggingLevel.NONE
                && this.setting.loggingLevelDatabase.ordinal() <= logLvl.ordinal()) {
                LOG_CACHE_DATABASE.add(log);
            }

            if (this.setting.loggingLevelAPI != LoggingLevel.NONE
                && this.setting.loggingLevelAPI.ordinal() <= logLvl.ordinal()) {
                LOG_CACHE_API.add(log);
            }

            if (this.setting.loggingLevelDebug != LoggingLevel.NONE
                && this.setting.loggingLevelDebug.ordinal() <= logLvl.ordinal()) {
                System.debug(logLvl, log);
            }
        }

        protected void addDBLog(Log log) {
            LOG_CACHE_DATABASE.add(log);
        }

        protected void addAllDBLogs(List<Log> logs) {
            LOG_CACHE_DATABASE.addAll(logs);
        }

        protected void addAPILog(Log log) {
            LOG_CACHE_API.add(log);
        }

        protected void addAllAPILogs(List<Log> logs) {
            LOG_CACHE_API.addAll(logs);
        }
    }

    public virtual class Log {
        @TestVisible
        @AuraEnabled
        protected Long tst { get; private set; }
        @TestVisible
        @AuraEnabled
        protected String nsp { get; private set; }
        @TestVisible
        @AuraEnabled
        protected String msg { get; private set; }
        @TestVisible
        @AuraEnabled
        protected String lvl { get; private set; }
        @TestVisible
        @AuraEnabled
        protected Object trc { get; private set; }

        public Log(LoggingLevel logLvl, String namespace, Object message, Object trace) {
            tst = Datetime.now().getTime();
            nsp = namespace;
            format(message, trace);

            switch on logLvl {
                when DEBUG {
                    lvl = 'D';
                }
                when ERROR {
                    lvl = 'E';
                }
                when INFO {
                    lvl = 'I';
                }
                when WARN {
                    lvl = 'W';
                }
                when FINE, FINER, FINEST {
                    lvl = 'F';
                }
                when else {
                    lvl = 'N';
                }
            }
        }

        protected virtual void format(Object message, Object trace) {
            if (message instanceOf Exception) {
                Exception ex = (Exception)message;
                msg = String.format('{0}: {1}\r\n{2}', new List<String> {
                    ex.getTypeName(),
                    ex.getMessage(),
                    ex.getStackTraceString()
                });
            } else if (trace == null) {
                msg = String.valueOf(message);
            } else if (trace instanceOf Exception) {
                Exception ex = (Exception)trace;
                msg = String.format('{0}|{1}: {2}\r\n{3}', new List<String> {
                    String.valueOf(message),
                    ex.getTypeName(),
                    ex.getMessage(),
                    ex.getStackTraceString()
                });
            } else {
                msg = (String)message;
                trc = trace;
            }
        }

        public virtual override String toString() {
            String format;
            if (trc != null) {
                if (trc instanceOf String) {
                    format = '[{0}]|{1}|"{2}"';
                    return String.format(format, new List<String> { nsp, msg, (String)trc });
                } else {
                    format = '[{0}]|{1}|{2}';
                    return String.format(format, new List<String> { nsp, msg, String.valueOf(trc) });
                }
            } else {
                format = '[{0}]|{1}';
                return String.format(format, new List<String> { nsp, msg });
            }
        }
    }
}