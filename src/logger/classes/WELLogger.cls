public with sharing class WELLogger {
    private static final Map<String, LoggingLevel> SYSTEM_LOGGING_LEVELS;
    @TestVisible
    private static final Map<String, LoggerSetting> LOGGER_SETTING_CACHE;
    private static final Map<String, Logger> LOGGER_CACHE;

    private static Integer LOG_CACHE_DATABASE_SAVE_INDEX;
    private static final List<Log> LOG_CACHE_DATABASE;
    private static final List<Log> LOG_CACHE_API;

    private static final String LOGGER_NAME_DEFAULT = 'default';
    private static final String LOGGER_NAME_MAIN = 'main';
    private static LoggerSetting DEFAULT_LOGGER_SETTING;
    private static final Logger MAIN_LOGGER;

    static {
        SYSTEM_LOGGING_LEVELS = new Map<String, LoggingLevel>();
        LOGGER_SETTING_CACHE = new Map<String, LoggerSetting>();
        LOGGER_CACHE = new Map<String, Logger>();
        LOG_CACHE_DATABASE_SAVE_INDEX = 0;
        LOG_CACHE_DATABASE = new List<Log>();
        LOG_CACHE_API = new List<Log>();

        loadLoggingLevelMap();
        loadLoggerSettings();
        MAIN_LOGGER = get(LOGGER_NAME_MAIN);
    }

    private WELLogger() {}

    public static Logger get(String name) {
        if (String.isBlank(name)) {
            return MAIN_LOGGER;
        }

        if (LOGGER_CACHE.containsKey(name)) {
            return LOGGER_CACHE.get(name);
        }

        return get(name, new Logger());
    }

    public static Logger get(String name, Type className) {
        if (String.isBlank(name)) {
            return MAIN_LOGGER;
        }

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

    private static Logger get(String namespace, Logger newLogger) {
        if (String.isBlank(namespace) || newLogger == null) {
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

    public static ILogger debug(Object message) {
        return MAIN_LOGGER.debug(LoggingLevel.DEBUG, message);
    }

    public static ILogger debug(LoggingLevel logLvl, Object message) {
        return MAIN_LOGGER.debug(logLvl, message);
    }

    public static ILogger debug(String message, Object trace) {
        return MAIN_LOGGER.debug(LoggingLevel.DEBUG, message, trace);
    }

    public static ILogger debug(LoggingLevel logLvl, String message, Object trace) {
        return MAIN_LOGGER.debug(logLvl, message, trace);
    }

    public static List<Log> logs {
        get {
            return LOG_CACHE_API;
        }
    }

    public static void save() {
        if (LOG_CACHE_DATABASE.SIZE() > LOG_CACHE_DATABASE_SAVE_INDEX) {
            List<WELLog__c> logs = new List<WELLog__c>();
            for (Integer i = LOG_CACHE_DATABASE_SAVE_INDEX; i < LOG_CACHE_DATABASE.SIZE(); i++) {
                Log log = LOG_CACHE_DATABASE[i];
                logs.add(new WELLog__c(
                    Level__c = log.lvl,
                    Namespace__c = log.nsp,
                    Timestamp__c = log.tst,
                    Message__c = log.msg,
                    Trace__c = String.valueOf(log.trc)
                ));
            }
            DATABASE.insert(logs);
            LOG_CACHE_DATABASE_SAVE_INDEX = LOG_CACHE_DATABASE.size();
        }
    }

    private static void loadLoggingLevelMap() {
        for (LoggingLevel enumValue : LoggingLevel.values()) {
            SYSTEM_LOGGING_LEVELS.put(String.valueOf(enumValue).toUpperCase(), enumValue);
        }
    }

    private static void loadLoggerSettings() {
        for (WELLoggerSetting__mdt setting : [
            SELECT
                MasterLabel,
                Enabled__c,
                Logging_Level_Database__c,
                Logging_Level_Debug__c,
                Logging_Level_API__c
            FROM WELLoggerSetting__mdt
        ]) {
            LOGGER_SETTING_CACHE.put(setting.MasterLabel, new LoggerSetting(setting));
        }

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
    }

    public class LoggerSetting {
        public LoggingLevel loggingLevelDatabase { get; set; }
        public LoggingLevel loggingLevelDebug { get; set; }
        public LoggingLevel loggingLevelAPI { get; set; }
        public Boolean enabled { get; set; }

        public LoggerSetting() {

        }

        public LoggerSetting(WELLoggerSetting__mdt setting) {
            enabled = setting.Enabled__c;
            loggingLevelDatabase = SYSTEM_LOGGING_LEVELS.get(setting.Logging_Level_Database__c);
            loggingLevelDebug = SYSTEM_LOGGING_LEVELS.get(setting.Logging_Level_Debug__c);
            loggingLevelAPI = SYSTEM_LOGGING_LEVELS.get(setting.Logging_Level_API__c);
        }
    }

    public interface LoggerInterface {
        ILogger debug(Object message);
        ILogger debug(LoggingLevel logLvl, Object message);
        ILogger debug(String message, Object trace);
        ILogger debug(LoggingLevel logLvl, String message, Object trace);
        void save();
    }

    public interface ILogger extends LoggerInterface  {

    }

    public virtual class Logger implements ILogger {
        @TestVisible
        protected LoggerSetting setting;
        @TestVisible
        protected String namespace;

        public ILogger debug(Object message) {
            this.internalDebug(LoggingLevel.DEBUG, message, null);
            return this;
        }

        public ILogger debug(LoggingLevel logLvl, Object message) {
            this.internalDebug(logLvl, message, null);
            return this;
        }

        public ILogger debug(String message, Object trace) {
            this.internalDebug(LoggingLevel.DEBUG, message, trace);
            return this;
        }

        public ILogger debug(LoggingLevel logLvl, String message, Object trace) {
            this.internalDebug(logLvl, message, trace);
            return this;
        }

        protected virtual void internalDebug(LoggingLevel logLvl, Object message, Object trace) {
            if (!this.setting.enabled) {
                System.debug(logLvl, message + '\n' + trace);
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

        public void save() {
            WELLogger.save();
        }
    }

    public virtual class Log {
        @TestVisible
        @AuraEnabled
        protected Datetime tst { get; private set; }
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
            tst = Datetime.now();
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
                msg = String.format('{0}: {1}', new List<String> {
                    ex.getTypeName(),
                    ex.getMessage()
                });
                trc = ex.getStackTraceString();
            } else if (trace == null) {
                msg = String.valueOf(message);
            } else if (trace instanceOf Exception) {
                Exception ex = (Exception)trace;
                msg = String.format('{0}|{1}: {2}', new List<String> {
                    String.valueOf(message),
                    ex.getTypeName(),
                    ex.getMessage()
                });
                trc = ex.getStackTraceString();
            } else {
                msg = String.valueOf(message);
                trc = trace;
            }
        }

        public virtual override String toString() {
            String format = '[{0}]|{1}';
            if (trc != null) {
                format = '[{0}]|{1}\n{2}';
            }
            return String.format(format,
                new List<String> { nsp, msg, String.valueOf(trc) });
        }
    }
}