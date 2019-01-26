@IsTest
private without sharing class WELLoggerTest {
    @IsTest
    static void testLoggingPerformance() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelDatabase = LoggingLevel.DEBUG;
        setting.loggingLevelDebug = LoggingLevel.DEBUG;
        setting.loggingLevelAPI = LoggingLevel.DEBUG;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        try {
            Map<String, String> dict;
            dict.get('key');
        } catch (Exception ex) {
            WELLogger.ILogger logger;
            for (Integer i = 0; i < 100; i++) {
                logger = WELLogger.get('test:' + i);
                logger.debug(LoggingLevel.ERROR, 'test performance', ex);
            }
        } finally {
            WELLogger.save();
        }

        System.debug(Limits.getCpuTime());
        List<WELLog__c> dbLogs = [
            SELECT Id
            FROM WELLog__c
        ];
        System.assertEquals(100, dbLogs.size());
        System.assertEquals(100, WELLogger.logs.size());
    }

    @IsTest
    static void testLoggerNamespace() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelDatabase = LoggingLevel.DEBUG;
        setting.loggingLevelDebug = LoggingLevel.DEBUG;
        setting.loggingLevelAPI = LoggingLevel.DEBUG;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger logger = WELLogger.get('test');
        System.assertEquals('test', ((WELLogger.Logger)logger).namespace);
        logger = logger.get('test');
        System.assertEquals('test:test', ((WELLogger.Logger)logger).namespace);
        logger.get('test');
        logger = logger.get('test');
        logger.get('test');
        System.assertEquals('test:test:test', ((WELLogger.Logger)logger).namespace);
    }

    @IsTest
    static void testLoggingLevelToString() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelDatabase = LoggingLevel.FINEST;
        setting.loggingLevelDebug = LoggingLevel.FINEST;
        setting.loggingLevelAPI = LoggingLevel.FINEST;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.get('test').debug('******');
        WELLogger.get('test').debug(LoggingLevel.DEBUG, '******');
        WELLogger.get('test').debug(LoggingLevel.ERROR, '******');
        WELLogger.get('test').debug(LoggingLevel.WARN, '******');
        WELLogger.get('test').debug(LoggingLevel.INFO, '******');
        WELLogger.get('test').debug(LoggingLevel.FINE, '******');
        WELLogger.get('test').debug(LoggingLevel.FINER, '******');
        WELLogger.get('test').debug(LoggingLevel.FINEST, '******');
        WELLogger.get('test').debug(LoggingLevel.NONE, '******');
        WELLogger.save();

        List<WELLogger.Log> logs = WELLogger.logs;
        List<WELLog__c> dbLogs = [
            SELECT Id
            FROM WELLog__c
        ];
        System.assertEquals(8, dbLogs.size());
        System.assertEquals(8, logs.size());
        System.assertEquals('D', logs[0].lvl);
        System.assertEquals('D', logs[1].lvl);
        System.assertEquals('E', logs[2].lvl);
        System.assertEquals('W', logs[3].lvl);
        System.assertEquals('I', logs[4].lvl);
        System.assertEquals('F', logs[5].lvl);
        System.assertEquals('F', logs[6].lvl);
        System.assertEquals('F', logs[7].lvl);
    }

    @IsTest
    static void testLoggingLevelDefault() {
        List<WELLogSetting__mdt> loggerSettings = [
            SELECT
                MasterLabel,
                Enabled__c,
                Logging_Level_Database__c,
                Logging_Level_Debug__c,
                Logging_Level_API__c
            FROM WELLogSetting__mdt
            WHERE MasterLabel = 'default'
        ];

        if (!loggerSettings.isEmpty()) {
            WELLogSetting__mdt loggerSetting = loggerSettings[0];
            WELLogger.LoggerSetting setting = ((WELLogger.Logger)WELLOGGER.get('test')).setting;
            System.assertEquals(loggerSetting.Logging_Level_Database__c, setting.loggingLevelDatabase.name());
            System.assertEquals(loggerSetting.Logging_Level_Debug__c, setting.loggingLevelDebug.name());
            System.assertEquals(loggerSetting.Logging_Level_API__c, setting.loggingLevelAPI.name());
            System.assertEquals(loggerSetting.Enabled__c, setting.enabled);
        } else {
            WELLogger.LoggerSetting setting = ((WELLogger.Logger)WELLOGGER.get('test')).setting;
            System.assertEquals(LoggingLevel.NONE, setting.loggingLevelDatabase);
            System.assertEquals(LoggingLevel.DEBUG, setting.loggingLevelDebug);
            System.assertEquals(LoggingLevel.NONE, setting.loggingLevelAPI);
            System.assertEquals(true, setting.enabled);
        }
    }

    @IsTest
    static void testLoggingNullException() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelDatabase = LoggingLevel.ERROR;
        setting.loggingLevelDebug = LoggingLevel.NONE;
        setting.loggingLevelAPI = LoggingLevel.ERROR;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        try {
            Map<String, String> dict;
            dict.get('key');
        } catch (Exception ex) {
            WELLogger.get('test').debug(LoggingLevel.ERROR, ex);
            WELLogger.save();
        }

        List<WELLog__c> dbLogs = [
            SELECT Id
            FROM WELLog__c
        ];
        System.assertEquals(1, WELLogger.logs.size());
        System.assertEquals(1, dbLogs.size());
    }

    @IsTest
    static void testLoggingOutputNONE() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelDatabase = LoggingLevel.NONE;
        setting.loggingLevelDebug = LoggingLevel.NONE;
        setting.loggingLevelAPI = LoggingLevel.NONE;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger a = WELLogger.get('test:a');
        a.debug('******');
        a.debug(LoggingLevel.ERROR, '******');
        a.debug(LoggingLevel.NONE, '******');
        WELLogger.save();

        WELLogger.ILogger b = WELLogger.get('test:b');
        b.debug(LoggingLevel.ERROR, '******');
        b.debug(LoggingLevel.NONE, '******');

        {
            List<WELLog__c> dbLogs = [
                SELECT Id
                FROM WELLog__c
            ];
            System.assertEquals(0, WELLogger.logs.size());
            System.assertEquals(0, dbLogs.size());
        }
    }

    @IsTest
    static void testLoggingOutputDisalbed() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = false;
        setting.loggingLevelDatabase = LoggingLevel.FINEST;
        setting.loggingLevelDebug = LoggingLevel.FINEST;
        setting.loggingLevelAPI = LoggingLevel.FINEST;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger a = WELLogger.get('test:a');
        a.debug('******');
        a.debug(LoggingLevel.ERROR, '******');
        a.debug(LoggingLevel.NONE, '******');
        WELLogger.save();

        WELLogger.ILogger b = WELLogger.get('test:b');
        b.debug(LoggingLevel.ERROR, '******');
        b.debug(LoggingLevel.NONE, '******');

        {
            List<WELLog__c> dbLogs = [
                SELECT Id
                FROM WELLog__c
            ];
            System.assertEquals(0, WELLogger.logs.size());
            System.assertEquals(0, dbLogs.size());
        }
    }

    @IsTest
    static void testLoggingOutputDatabaseAndAPI() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelDatabase = LoggingLevel.ERROR;
        setting.loggingLevelDebug = LoggingLevel.DEBUG;
        setting.loggingLevelAPI = LoggingLevel.DEBUG;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger a = WELLogger.get('test:a');
        a.debug('******');
        a.debug('******');

        a.debug(LoggingLevel.ERROR, '******');
        a.debug(LoggingLevel.ERROR, '******');
        WELLogger.save();

        WELLogger.ILogger b = WELLogger.get('test:b');
        b.debug(LoggingLevel.ERROR, '******');
        b.debug(LoggingLevel.ERROR, '******');

        {
            List<WELLog__c> dbLogs = [
                SELECT Id
                FROM WELLog__c
            ];
            System.assertEquals(6, WELLogger.logs.size());
            System.assertEquals(2, dbLogs.size());
        }

        WELLogger.save();
        {
            List<WELLog__c> dbLogs = [
                SELECT Id
                FROM WELLog__c
            ];
            System.assertEquals(4, dbLogs.size());
            System.assertEquals(6, WELLogger.logs.size());
        }
    }

    @IsTest
    static void testCustomLogger() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelDatabase = LoggingLevel.NONE;
        setting.loggingLevelDebug = LoggingLevel.NONE;
        setting.loggingLevelAPI = LoggingLevel.NONE;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger c = WELLogger.get('test:c', CustomLogger.class);
        c.debug('******');
        WELLogger.save();

        List<WELLog__c> dbLogs = [
            SELECT Id
            FROM WELLog__c
        ];
        System.assertEquals(3, dbLogs.size());
        System.assertEquals(3, WELLogger.logs.size());
    }

    class CustomLogger extends WELLogger.Logger {
        protected override void internalDebug(LoggingLevel logLvl, Object message, Object trace) {
            // coverage for add*** methods
            WELLogger.Log log = new WELLogger.Log(logLvl, this.namespace, message, trace);
            if (this.setting.loggingLevelDatabase == LoggingLevel.NONE) {
                this.addDBLog(log);
            }
            if (this.setting.loggingLevelAPI == LoggingLevel.NONE) {
                this.addAPILog(log);
            }

            // coverage for addALL*** methods
            List<WELLogger.Log> logs = new List<WELLogger.Log>();
            logs.add(new WELLogger.Log(logLvl, this.namespace + ':all', message, trace));
            logs.add(new WELLogger.Log(logLvl, this.namespace + ':all', message, trace));

            if (this.setting.loggingLevelDatabase == LoggingLevel.NONE) {
                this.addAllDBLogs(logs);
            }
            if (this.setting.loggingLevelAPI == LoggingLevel.NONE) {
                this.addAllAPILogs(logs);
            }

            System.debug(log);
        }
    }
}
