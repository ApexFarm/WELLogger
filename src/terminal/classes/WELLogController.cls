public with sharing class WELLogController {

    @AuraEnabled
    public static User getUser(Id userId) {
        List<User> users = [SELECT Id, Name FROM User WHERE Id =: userId];
        if (users.size() == 1) {
            return users[0];
        }
        return null;
    }
}
