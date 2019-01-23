public with sharing class WELSampleController {
    private static WELLogger.ILogger a = WELLogger.get('worker:a');
    private static WELLogger.ILogger b = WELLogger.get('worker:b');

    public class Response {
        @AuraEnabled
        Object logs { get; set; }
    }

    @RemoteAction
    @AuraEnabled
    public static Response doSomeWork(String token) {
        Response res = new Response();
        try {
            WELLogger.debug('My App');
            a.debug('doing lots of uninteresting work');
            b.debug('doing some work');
            a.debug('doing lots of uninteresting work');
            b.debug('doing some work');
            WELLogger.debug('My App');
            a.debug('doing lots of uninteresting work');
            b.debug('doing some work');
            a.debug('doing lots of uninteresting work');
            b.debug('doing some work');

            WELLogger.debug('a list of objects', [
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
            WELLogger.debug(LoggingLevel.ERROR, ex);
        } catch(Exception ex) {
            WELLogger.debug(LoggingLevel.ERROR, ex);
        } finally {
            res.logs = WELLogger.logs;
            WELLogger.save();
        }
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
