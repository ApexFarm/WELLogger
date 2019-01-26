public with sharing class WELSampleController {
    private static WELLogger.ILogger logger = WELLogger.get('sample:controller');

    public class Response {
        @AuraEnabled
        Object logs { get; set; }
    }

    @RemoteAction
    @AuraEnabled
    public static Response doSomeWork(String param1, Decimal param2) {
        logger.debug('[M:E] doSomeWork()'); // log for method enter
        logger.debug('[P:param1]', param1); // log for parameter
        logger.debug('[P:param2]', param2); // log for parameter

        Response res = new Response();
        try {
            logger.debug(LoggingLevel.INFO, 'doing lots of uninteresting work');
            logger.debug(LoggingLevel.WARN, 'doing some work');
            logger.debug(LoggingLevel.INFO, 'doing lots of uninteresting work');
            logger.debug(LoggingLevel.WARN, 'doing some work');
            logger.debug('a list of objects', [
                SELECT
                    MasterLabel,
                    Enabled__c,
                    Logging_Level_Database__c,
                    Logging_Level_Debug__c,
                    Logging_Level_API__c
                FROM WELLogSetting__mdt
            ]);
            invokeNullReferenceException();
        } catch (DmlException ex) {
            logger.get('ex').debug(LoggingLevel.ERROR, ex); // use ex as modifier
        } catch(Exception ex) {
            logger.get('ex').debug(LoggingLevel.ERROR, ex); // use ex as modifier
        } finally {
            WELLogger.save();          // output to database
            res.logs = WELLogger.logs; // output to browser
        }

        logger.debug('[M:X] doSomeWork()'); // log for method exit
        return res;
    }

    static void invokeNullReferenceException() {
        String s;
        s.toLowerCase();
    }

    static void invokeDMLException() {
        WELLog__c log = new WELLog__c(
            Namespace__c =
                'aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeee' +
                'aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeee' +
                'aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeee' +
                'aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeee' +
                'aaaaaaaaaabbbbbbbbbbccccccccccddddddddddeeeeeeeeee' +
                '123456'
        );
        insert log;
    }
}
