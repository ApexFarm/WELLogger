var debug = require('./debug/browser.js');
module.exports = function(logs) {
  if (logs != null && Array.isArray(logs) && logs.length > 0) {
    if(!debug.enabled('*')) {
      debug.enable('*');
    }
    debug.log('==========BEGIN==========');
    logs.forEach(log => {
      var nsp = debug(log.nsp);
      if (log.trc) {
        if (typeof log.trc === 'string') {
          nsp(log.tst, '%s "%s"', log.msg, log.trc);
        } else if (typeof log.trc != 'object') {
          nsp(log.tst, '%s %o', log.msg, log.trc);
        } else {
          nsp(log.tst, '%s\n%o', log.msg, log.trc);
        }
      } else {
        nsp(log.tst, log.msg);
      }
    });
    debug.log('===========END===========');
  }
}
