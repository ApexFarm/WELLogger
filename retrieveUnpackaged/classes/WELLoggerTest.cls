@IsTest
private without sharing class WELLoggerTest {
    @IsTest
    static void testLoggerSettingDefault() {
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
            WELLogger.LoggerSetting setting = WELLOGGER.get('test').setting;
            System.assertEquals(loggerSetting.Logging_Level_Database__c, setting.loggingLevelDatabase.name());
            System.assertEquals(loggerSetting.Logging_Level_Debug__c, setting.loggingLevelDebug.name());
            System.assertEquals(loggerSetting.Logging_Level_API__c, setting.loggingLevelAPI.name());
            System.assertEquals(loggerSetting.Enabled__c, setting.enabled);
        } else {
            WELLogger.LoggerSetting setting = WELLOGGER.get('test').setting;
            System.assertEquals(LoggingLevel.NONE, setting.loggingLevelDatabase);
            System.assertEquals(LoggingLevel.DEBUG, setting.loggingLevelDebug);
            System.assertEquals(LoggingLevel.NONE, setting.loggingLevelAPI);
            System.assertEquals(true, setting.enabled);
        }
    }

    @IsTest
    static void testLogLevel() {
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
    static void testLogNullException() {
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
            WELLogger.get('test').debug(LoggingLevel.ERROR, ex).save();
        }
        List<WELLogger.Log> logs = WELLogger.logs;
        List<WELLog__c> dbLogs = [
            SELECT Id
            FROM WELLog__c
        ];
        System.assertEquals(1, dbLogs.size());
        System.assertEquals(1, logs.size());
    }

    @IsTest
    static void testLogModuleForError() {
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
            List<WELLogger.Log> logs = WELLogger.logs;
            System.assertEquals(6, logs.size());
            List<WELLog__c> dbLogs = [
                SELECT Id
                FROM WELLog__c
            ];
            System.assertEquals(2, dbLogs.size());
        }

        WELLogger.save();
        {
            List<WELLogger.Log> logs = WELLogger.logs;
            System.assertEquals(6, logs.size());
            List<WELLog__c> dbLogs = [
                SELECT Id
                FROM WELLog__c
            ];
            System.assertEquals(4, dbLogs.size());
        }
    }

    @IsTest
    static void testLogModuleForNONE() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelDatabase = LoggingLevel.NONE;
        setting.loggingLevelDebug = LoggingLevel.NONE;
        setting.loggingLevelAPI = LoggingLevel.NONE;
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
            List<WELLogger.Log> logs = WELLogger.logs;
            System.assertEquals(0, logs.size());
            List<WELLog__c> dbLogs = [
                SELECT Id
                FROM WELLog__c
            ];
            System.assertEquals(0, dbLogs.size());
        }
    }

    class CustomLogger extends WELLogger.Logger {
        protected override void internalDebug(LoggingLevel logLvl, Object message, Object trace) {
            // test add*** methods
            WELLogger.Log log = new WELLogger.Log(logLvl, this.namespace, message, trace);
            if (this.setting.loggingLevelDatabase == LoggingLevel.NONE) {
                this.addDBLog(log);
            }
            if (this.setting.loggingLevelAPI == LoggingLevel.NONE) {
                this.addAPILog(log);
            }

            // test addALL*** methods
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

    @IsTest
    static void testCustomLogger() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelDatabase = LoggingLevel.NONE;
        setting.loggingLevelDebug = LoggingLevel.NONE;
        setting.loggingLevelAPI = LoggingLevel.NONE;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger c = WELLogger.get('test:c', CustomLogger.class);
        c.debug('******').save();
        System.assertEquals(3, WELLogger.logs.size());
        List<WELLog__c> dbLogs = [
            SELECT Id
            FROM WELLog__c
        ];
        System.assertEquals(3, dbLogs.size());
    }

    @IsTest
    static void TestSave() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelDatabase = LoggingLevel.DEBUG;
        setting.loggingLevelDebug = LoggingLevel.DEBUG;
        setting.loggingLevelAPI = LoggingLevel.DEBUG;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger a = WELLogger.get('test:a');
        a.debug('******').save();
        {
            List<WELLog__c> dbLogs = [
                SELECT Id
                FROM WELLog__c
            ];
            System.assertEquals(1, dbLogs.size());
        }

        a.debug('******').save();
        a.debug('******');
        a.debug('******').save();
        a.debug('******');
        {
            List<WELLog__c> dbLogs = [
                SELECT Id
                FROM WELLog__c
            ];
            System.assertEquals(4, dbLogs.size());
        }

        WELLogger.save();
        WELLogger.save();
        WELLogger.save();
        a.debug('******');
        {
            List<WELLog__c> dbLogs = [
                SELECT Id
                FROM WELLog__c
            ];
            System.assertEquals(5, dbLogs.size());
        }

        WELLogger.save();
        a.debug('******').save();
        {
            List<WELLog__c> dbLogs = [
                SELECT Id
                FROM WELLog__c
            ];
            System.assertEquals(7, dbLogs.size());
        }
    }
}