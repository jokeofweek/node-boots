var sys = require('sys'),
    Middleware = require('./middleware.js').Middleware;

/**
 * The basic STOMP 1.2 middleware protocol. Only receives requests if the
 * client was actually connected.
 * @constructor
 */
function Stomp12() {
};
sys.inherits(Stomp12, Middleware);

/**
 * @override
 */
Stomp12.prototype.onReceive = function(session, request, next) {
  // TODO: Need to allow adding to a buffer for a session before we can implement this.
};

module.exports.Stomp12 = Stomp12;