@isTest
private with sharing class WELLogControllerTest {

    @isTest
    static void testGetUser() {
        User retUser = WELLogController.getUser(null);
        System.assertEquals(null, retUser);
    }
}
