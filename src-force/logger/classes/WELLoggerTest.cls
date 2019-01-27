@IsTest
private without sharing class WELLoggerTest {
    @IsTest
    static void testLoggingPerformance() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelEvent = LoggingLevel.DEBUG;
        setting.loggingLevelDebug = LoggingLevel.DEBUG;
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
    }

    @IsTest
    static void testLoggerNamespace() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelEvent = LoggingLevel.DEBUG;
        setting.loggingLevelDebug = LoggingLevel.DEBUG;
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

    // @IsTest
    // static void testLoggingLevelToString() {
    //     WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
    //     setting.enabled = true;
    //     setting.loggingLevelEvent = LoggingLevel.FINEST;
    //     setting.loggingLevelDebug = LoggingLevel.FINEST;
    //     WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

    //     WELLogger.get('test').debug('******');
    //     WELLogger.get('test').debug(LoggingLevel.DEBUG, '******');
    //     WELLogger.get('test').debug(LoggingLevel.ERROR, '******');
    //     WELLogger.get('test').debug(LoggingLevel.WARN, '******');
    //     WELLogger.get('test').debug(LoggingLevel.INFO, '******');
    //     WELLogger.get('test').debug(LoggingLevel.FINE, '******');
    //     WELLogger.get('test').debug(LoggingLevel.FINER, '******');
    //     WELLogger.get('test').debug(LoggingLevel.FINEST, '******');
    //     WELLogger.get('test').debug(LoggingLevel.NONE, '******');
    //     WELLogger.save();

    //     System.assertEquals(8, logs.size());
    //     System.assertEquals('D', logs[0].lvl);
    //     System.assertEquals('D', logs[1].lvl);
    //     System.assertEquals('E', logs[2].lvl);
    //     System.assertEquals('W', logs[3].lvl);
    //     System.assertEquals('I', logs[4].lvl);
    //     System.assertEquals('F', logs[5].lvl);
    //     System.assertEquals('F', logs[6].lvl);
    //     System.assertEquals('F', logs[7].lvl);
    // }

    @IsTest
    static void testLoggingLevelDefault() {
        List<WELLogSetting__mdt> loggerSettings = [
            SELECT
                MasterLabel,
                Enabled__c,
                Logging_Level_Event__c,
                Logging_Level_Debug__c
            FROM WELLogSetting__mdt
            WHERE MasterLabel = 'default'
        ];

        if (!loggerSettings.isEmpty()) {
            WELLogSetting__mdt loggerSetting = loggerSettings[0];
            WELLogger.LoggerSetting setting = ((WELLogger.Logger)WELLOGGER.get('test')).setting;
            System.assertEquals(loggerSetting.Logging_Level_Event__c, setting.loggingLevelEvent.name());
            System.assertEquals(loggerSetting.Logging_Level_Debug__c, setting.loggingLevelDebug.name());
            System.assertEquals(loggerSetting.Enabled__c, setting.enabled);
        } else {
            WELLogger.LoggerSetting setting = ((WELLogger.Logger)WELLOGGER.get('test')).setting;
            System.assertEquals(LoggingLevel.NONE, setting.loggingLevelEvent);
            System.assertEquals(LoggingLevel.DEBUG, setting.loggingLevelDebug);
            System.assertEquals(true, setting.enabled);
        }
    }

    @IsTest
    static void testLoggingNullException() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelEvent = LoggingLevel.ERROR;
        setting.loggingLevelDebug = LoggingLevel.NONE;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        try {
            Map<String, String> dict;
            dict.get('key');
        } catch (Exception ex) {
            WELLogger.get('test').debug(LoggingLevel.ERROR, ex);
            WELLogger.save();
        }
    }

    @IsTest
    static void testLoggingOutputNONE() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelEvent = LoggingLevel.NONE;
        setting.loggingLevelDebug = LoggingLevel.NONE;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger a = WELLogger.get('test:a');
        a.debug('******');
        a.debug(LoggingLevel.ERROR, '******');
        a.debug(LoggingLevel.NONE, '******');
        WELLogger.save();

        WELLogger.ILogger b = WELLogger.get('test:b');
        b.debug(LoggingLevel.ERROR, '******');
        b.debug(LoggingLevel.NONE, '******');
    }

    @IsTest
    static void testLoggingOutputDisalbed() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = false;
        setting.loggingLevelEvent = LoggingLevel.FINEST;
        setting.loggingLevelDebug = LoggingLevel.FINEST;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger a = WELLogger.get('test:a');
        a.debug('******');
        a.debug(LoggingLevel.ERROR, '******');
        a.debug(LoggingLevel.NONE, '******');
        WELLogger.save();

        WELLogger.ILogger b = WELLogger.get('test:b');
        b.debug(LoggingLevel.ERROR, '******');
        b.debug(LoggingLevel.NONE, '******');
    }

    @IsTest
    static void testLoggingOutputDatabaseAndAPI() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelEvent = LoggingLevel.ERROR;
        setting.loggingLevelDebug = LoggingLevel.DEBUG;
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


        WELLogger.save();
    }

    @IsTest
    static void testCustomLogger() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelEvent = LoggingLevel.NONE;
        setting.loggingLevelDebug = LoggingLevel.NONE;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger c = WELLogger.get('test:c', CustomLogger.class);
        c.debug('******');
        WELLogger.save();

    }

    class CustomLogger extends WELLogger.Logger {
        protected override void internalDebug(LoggingLevel logLvl, Object message, Object trace) {
            // coverage for add*** methods
            WELLogger.Log log = new WELLogger.Log(logLvl, this.namespace, message, trace);
            if (this.setting.loggingLevelEvent == LoggingLevel.NONE) {
                this.addLog(log);
            }

            // coverage for addALL*** methods
            List<WELLogger.Log> logs = new List<WELLogger.Log>();
            logs.add(new WELLogger.Log(logLvl, this.namespace + ':all', message, trace));
            logs.add(new WELLogger.Log(logLvl, this.namespace + ':all', message, trace));

            if (this.setting.loggingLevelEvent == LoggingLevel.NONE) {
                this.addAllLogs(logs);
            }
        }
    }
}
