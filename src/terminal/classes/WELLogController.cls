public with sharing class WELLogController {

    @AuraEnabled
    public static User getUser(Id userId) {
        return [SELECT Id, Name FROM User WHERE Id =: userId];
    }
}
