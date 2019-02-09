public with sharing class WELSampleController {
    private static WELLogger.ILogger logger = WELLogger.get('sample:controller');
    private static WELLogger.ILogger loggerA = WELLogger.get('a:logger');
    private static WELLogger.ILogger loggerB = WELLogger.get('b:logger');

    public class Response {
    }

    @RemoteAction
    @AuraEnabled
    public static Response doSomeWork(String param1, Decimal param2) {
        logger.debug('[M:E] doSomeWork()'); // log for method enter
        logger.debug('[P:param1]', param1); // log for parameter
        logger.debug('[P:param2]', param2); // log for parameter

        Response res = new Response();
        try {
            WELLogger.debug(LoggingLevel.DEBUG, 'doing lots of uninteresting work');
            loggerA.debug(LoggingLevel.INFO, 'doing some work');
            loggerB.debug(LoggingLevel.WARN, 'don\'t do this work');
            logger.debug('a list of objects', [
                SELECT
                    MasterLabel,
                    Enabled__c,
                    Logging_Level_Event__c,
                    Logging_Level_Debug__c
                FROM WELLogSetting__mdt
            ]);
            invokeNullReferenceException();
        } catch (DmlException ex) {
            logger.get('ex').debug(LoggingLevel.ERROR, ex); // use ex as modifier
        } catch(Exception ex) {
            logger.get('ex').debug(LoggingLevel.ERROR, ex); // use ex as modifier
        } finally {
            WELLogger.save(); // publish to platform event
        }

        logger.debug('[M:X] doSomeWork()'); // log for method exit
        return res;
    }

    static void invokeNullReferenceException() {
        String s;
        s.toLowerCase();
    }
}
