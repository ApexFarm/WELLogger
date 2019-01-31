({
    doInit: function(cmp) {
        this.propertirizeElement(cmp, 'empApi');
        this.propertirizeElement(cmp, 'logEventContainer');
        this.propertirizeAttribute(cmp, 'subscription');

        this.empApi.onError($A.getCallback(error => {
            console.error('EMP API error: ', error);
        }));
    },

    propertirizeElement: function(cmp, name) {
        var element = null;
        Object.defineProperty(this, name, {
            get: function() {
                if (!element) {
                    element = cmp.find(name);
                }
                return element;
            },
        });
    },

    propertirizeAttribute: function(cmp, name) {
        const attName = 'v.' + name;
        Object.defineProperty(this, name, {
            get: function() {
                return cmp.get(attName);
            },
            set: function(value) {
                cmp.set(attName, value);
            },
        });
    },

    subscribe : function() {
        return this.empApi.subscribe('/event/WELLog__e', -1, $A.getCallback(logEvent => {
            this.logEventContainer.addLogEvent(logEvent);
        }))
        .then(subscription => {
            console.log('Subscribed to channel ', subscription.channel);
            this.subscription = subscription;
        });
    },

    unsubscribe : function() {
        return this.empApi.unsubscribe(this.subscription, $A.getCallback(unsubscribed => {
            console.log('Unsubscribed from channel ' + unsubscribed.subscription);
            this.subscription = null;
        }));
    },
})
