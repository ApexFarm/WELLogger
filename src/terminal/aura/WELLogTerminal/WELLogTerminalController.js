({
    doInit : function(cmp, event, helper) {
        helper.doInit(cmp);
        helper.subscribe();
    },

    toggleSubscription: function(cmp, event, helper) {
        if (helper.subscription) {
            helper.unsubscribe();
        } else {
            helper.subscribe();
        }
    },
})
