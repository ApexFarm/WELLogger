({
    doInit : function(cmp, event, helper) {
        helper.propertirizeElement(cmp, 'empApi');
        helper.propertirizeElement(cmp, 'logEventContainer');
        helper.propertirizeAttribute(cmp, 'subscription');
        helper.propertirizeAttribute(cmp, 'isFullscreen');

        // helper.empApi.setDebugFlag(true);
        helper.empApi.onError($A.getCallback(error => {
            console.error('EMP API error: ', JSON.parse(JSON.stringify(error)));
        }));
        helper.subscribe();
    },

    toggleSubscription: function(cmp, event, helper) {
        if (helper.subscription) {
            helper.unsubscribe();
        } else {
            helper.subscribe();
        }
    },

    toggleFullscreen: function(cmp, event, helper) {
        helper.isFullscreen = !helper.isFullscreen;
    },
})
