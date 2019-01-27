var debug = require('./debug/browser.js');
var debugs = {};
module.exports = function(logs) {
    if (logs != null && Array.isArray(logs) && logs.length > 0) {
        if(!debug.enabled('*')) {
            debug.enable('*');
        }
        debug.log('==========BEGIN==========');
        logs.forEach(log => {
            var nsp = debugs[log.nsp];
            if (!nsp) {
                nsp = debug(log.nsp);
                debugs[log.nsp] = nsp;
            }

            if (log.trc) {
                if (typeof log.trc === 'string') {
                    nsp(log.lvl, log.tst, '%s "%s"', log.msg, log.trc);
                } else {
                    nsp(log.lvl, log.tst, '%s %o', log.msg, log.trc);
                }
            } else {
                nsp(log.lvl, log.tst, log.msg.replace(/\n/g, '\n   '));
            }
        });
        debug.log('===========END===========');
    }
}
