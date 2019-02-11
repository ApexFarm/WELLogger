@IsTest
private without sharing class WELLoggerTest {
    static void addField(Metadata.CustomMetadata customMetadata, String fieldName, Object value) {
        Metadata.CustomMetadataValue customField = new Metadata.CustomMetadataValue();
        customField.field = fieldName;
        customField.value = value;
        customMetadata.values.add(customField);
    }

    @IsTest static void testLoggingPerformance() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelObject = LoggingLevel.DEBUG;
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

    @IsTest static void testLoggerNamespaceChaining() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelObject = LoggingLevel.DEBUG;
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

    @IsTest static void testLoggingLevelToString() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelObject = LoggingLevel.FINEST;
        setting.loggingLevelEvent = LoggingLevel.FINEST;
        setting.loggingLevelDebug = LoggingLevel.FINEST;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.get('test').debug('******');
        WELLogger.get('test').debug(LoggingLevel.DEBUG, '******');
        WELLogger.get('test').debug(LoggingLevel.ERROR, '******');
        WELLogger.get('test').debug(LoggingLevel.WARN, '******');
        WELLogger.get('test').debug(LoggingLevel.INFO, '******');
        WELLogger.get('test').debug(LoggingLevel.FINE, '******');
        WELLogger.get('test').debug(LoggingLevel.FINER, '******');
        WELLogger.get('test').debug(LoggingLevel.FINEST, '******');
        // NONE will disable the log
        WELLogger.get('test').debug(LoggingLevel.NONE, '******');

        System.assertEquals(8, WELLogger.LOG_QUEUE_EVENT.size());
        System.assertEquals('D', WELLogger.LOG_QUEUE_EVENT[0].lvl);
        System.assertEquals('D', WELLogger.LOG_QUEUE_EVENT[1].lvl);
        System.assertEquals('E', WELLogger.LOG_QUEUE_EVENT[2].lvl);
        System.assertEquals('W', WELLogger.LOG_QUEUE_EVENT[3].lvl);
        System.assertEquals('I', WELLogger.LOG_QUEUE_EVENT[4].lvl);
        System.assertEquals('F', WELLogger.LOG_QUEUE_EVENT[5].lvl);
        System.assertEquals('F', WELLogger.LOG_QUEUE_EVENT[6].lvl);
        System.assertEquals('F', WELLogger.LOG_QUEUE_EVENT[7].lvl);
    }

    @IsTest static void testLoggingLevelDefault() {
        List<WELLogSetting__mdt> loggerSettings = [
            SELECT
                MasterLabel,
                Enabled__c,
                Logging_Level_Object__c,
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

    @IsTest static void testLoggingNullException() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelObject = LoggingLevel.ERROR;
        setting.loggingLevelEvent = LoggingLevel.ERROR;
        setting.loggingLevelDebug = LoggingLevel.NONE;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        try {
            Map<String, String> dict;
            dict.get('key');
        } catch (Exception ex) {
            WELLogger.get('test').debug(LoggingLevel.ERROR, ex);

        }
        System.assertEquals(1, WELLogger.LOG_QUEUE_EVENT.size());
    }

    @IsTest static void testLoggingOutputNONE() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelObject = LoggingLevel.NONE;
        setting.loggingLevelEvent = LoggingLevel.NONE;
        setting.loggingLevelDebug = LoggingLevel.NONE;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger a = WELLogger.get('test:a');
        a.debug('******');
        a.debug(LoggingLevel.ERROR, '******');
        a.debug(LoggingLevel.NONE, '******');
        System.assertEquals(0, WELLogger.LOG_QUEUE_EVENT.size());

        WELLogger.ILogger b = WELLogger.get('test:b');
        b.debug(LoggingLevel.ERROR, '******');
        b.debug(LoggingLevel.NONE, '******');
        System.assertEquals(0, WELLogger.LOG_QUEUE_EVENT.size());
    }

    @IsTest static void testLoggingOutputDisalbed() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = false;
        setting.loggingLevelObject = LoggingLevel.FINEST;
        setting.loggingLevelEvent = LoggingLevel.FINEST;
        setting.loggingLevelDebug = LoggingLevel.FINEST;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger a = WELLogger.get('test:a');
        a.debug('******');
        a.debug(LoggingLevel.ERROR, '******');
        a.debug(LoggingLevel.NONE, '******');
        System.assertEquals(0, WELLogger.LOG_QUEUE_EVENT.size());

        WELLogger.ILogger b = WELLogger.get('test:b');
        b.debug(LoggingLevel.ERROR, '******');
        b.debug(LoggingLevel.NONE, '******');
        System.assertEquals(0, WELLogger.LOG_QUEUE_EVENT.size());
    }

    @IsTest static void testLoggingOutputEventAndDebug() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelObject = LoggingLevel.ERROR;
        setting.loggingLevelEvent = LoggingLevel.ERROR;
        setting.loggingLevelDebug = LoggingLevel.DEBUG;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger a = WELLogger.get('test:a');
        a.debug('******');
        a.debug('******');
        a.debug(LoggingLevel.ERROR, '******');
        a.debug(LoggingLevel.ERROR, '******');
        System.assertEquals(2, WELLogger.LOG_QUEUE_EVENT.size());
        WELLogger.save();
        System.assertEquals(0, WELLogger.LOG_QUEUE_EVENT.size());

        WELLogger.ILogger b = WELLogger.get('test:b');
        b.debug('******', '******');
        b.debug('******', '******');
        System.assertEquals(0, WELLogger.LOG_QUEUE_EVENT.size());
        a.debug(LoggingLevel.ERROR, '******', '******');
        a.debug(LoggingLevel.ERROR, '******', '******');
        System.assertEquals(2, WELLogger.LOG_QUEUE_EVENT.size());
        WELLogger.save();
        System.assertEquals(0, WELLogger.LOG_QUEUE_EVENT.size());
    }

    @IsTest static void testMainLogger() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelObject = LoggingLevel.ERROR;
        setting.loggingLevelEvent = LoggingLevel.ERROR;
        setting.loggingLevelDebug = LoggingLevel.DEBUG;
        WELLogger.LOGGER_SETTING_CACHE.put(WELLogger.LOGGER_NAME_MAIN, setting);

        // inject main logger
        WELLogger.LOGGER_CACHE.clear();
        WELLogger.MAIN_LOGGER = WELLogger.get('main');

        WELLogger.debug('******');
        WELLogger.debug('******');
        WELLogger.debug(LoggingLevel.ERROR, '******');
        WELLogger.debug(LoggingLevel.ERROR, '******');
        System.assertEquals(2, WELLogger.LOG_QUEUE_EVENT.size());
        WELLogger.save();
        System.assertEquals(0, WELLogger.LOG_QUEUE_EVENT.size());

        WELLogger.debug('******', '******');
        WELLogger.debug('******', '******');
        System.assertEquals(0, WELLogger.LOG_QUEUE_EVENT.size());
        WELLogger.debug(LoggingLevel.ERROR, '******', '******');
        WELLogger.debug(LoggingLevel.ERROR, '******', '******');
        System.assertEquals(2, WELLogger.LOG_QUEUE_EVENT.size());
        WELLogger.save();
        System.assertEquals(0, WELLogger.LOG_QUEUE_EVENT.size());
    }

    @IsTest static void testCustomLogger() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelObject = LoggingLevel.DEBUG;
        setting.loggingLevelEvent = LoggingLevel.DEBUG;
        setting.loggingLevelDebug = LoggingLevel.DEBUG;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger c1 = WELLogger.get('test:c');
        c1.debug('******');
        System.assertEquals(1, WELLogger.LOG_QUEUE_EVENT.size());

        WELLogger.ILogger c2 = WELLogger.get('test:c');
        System.assertEquals(c1, c2);

        WELLogger.ILogger c3 = WELLogger.get(null);
        System.assertEquals(WELLogger.MAIN_LOGGER, c3);
    }

    @IsTest static void testCustomLoggerExtension() {
        WELLogger.LoggerSetting setting = new WELLogger.LoggerSetting();
        setting.enabled = true;
        setting.loggingLevelObject = LoggingLevel.NONE;
        setting.loggingLevelEvent = LoggingLevel.NONE;
        setting.loggingLevelDebug = LoggingLevel.NONE;
        WELLogger.LOGGER_SETTING_CACHE.put('test', setting);

        WELLogger.ILogger c1 = WELLogger.get('test:c', CustomLogger.class);
        c1.debug('******');
        System.assertEquals(3, WELLogger.LOG_QUEUE_EVENT.size());

        WELLogger.ILogger c2 = WELLogger.get('test:c', CustomLogger.class);
        System.assertEquals(c1, c2);

        WELLogger.ILogger c4 = WELLogger.get('test:c4', Map<String, String>.class);
        System.assertEquals(WELLogger.MAIN_LOGGER, c4);
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
