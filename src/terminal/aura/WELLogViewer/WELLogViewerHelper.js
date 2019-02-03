({
    propertirizeElement: function(cmp, name) {
        var element = null;
        Object.defineProperty(this, name, {
            get: function() {
                if (!element) {
                    element = cmp.find(name);
                }
                return element;
            },
            configurable: true,
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
            configurable: true,
        });
    },

    subscribe: function() {
        return this.empApi.subscribe('/event/WELLogEvent__e', -1, $A.getCallback(logEvent => {
            this.logContainer.addLogEvent(logEvent);
        }))
        .then(subscription => {
            console.info('Subscribed to channel ', subscription.channel);
            this.subscription = subscription;
            return this.subscription;
        });
    },

    unsubscribe: function() {
        return this.empApi.unsubscribe(this.subscription, $A.getCallback(unsubscribed => {
            console.info('Unsubscribed from channel '+ unsubscribed.subscription);
        }))
        .then((success) => {
            if (success) {
                this.subscription = null;
            }
        });
    },
})
