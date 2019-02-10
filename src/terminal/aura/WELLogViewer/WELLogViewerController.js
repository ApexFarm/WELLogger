({
    doInit: function(cmp, event, helper) {
        helper.propertirizeElement(cmp, 'empApi');
        helper.propertirizeElement(cmp, 'logApp');
        helper.propertirizeAttribute(cmp, 'subscription');

        // helper.empApi.setDebugFlag(true);
        helper.empApi.onError($A.getCallback(error => {
            console.error('EMP API error: ', JSON.parse(JSON.stringify(error)));
        }));

        if (helper.subscription) {
            helper.unsubscribe(helper.subscription)
            .then(() => {
                helper.subscribe();
            })
        } else {
            helper.subscribe();
        }
    },

    toggleSubscription: function(cmp, event, helper) {
        if (helper.subscription) {
            helper.unsubscribe();
        } else {
            helper.subscribe();
        }
    },
})
