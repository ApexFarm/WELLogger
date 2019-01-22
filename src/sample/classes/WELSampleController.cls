public with sharing class WELSampleController {
    private static WELLogger.ILogger a = WELLogger.get('worker:a');
    private static WELLogger.ILogger b = WELLogger.get('worker:b');

    public class Response {
        Object logs { get; set; }
    }

    @RemoteAction
    public static Response doSomething() {
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
                FROM WELLoggerSetting__mdt
            ]);
            invokeNullReferenceException();
        } catch(Exception ex) {
            WELLogger.debug(ex);
        } finally {
            res.logs = WELLogger.logs;
        }
        return res;
    }

    static void invokeNullReferenceException() {
        String s;
        s.toLowerCase();
    }
}