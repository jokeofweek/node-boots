var sys = require('sys'),
    Protocol = require('./protocol.js').Protocol;

/**
 * A protocol for STOMP 1.2.
 * @constructor
 * @extends {Protocol}
 */
function Stomp12Protocol() {
  // Parent constructor.
  Protocol.call(this);
};
sys.inherits(Stomp12Protocol, Protocol);

/**
 * @override
 */
Stomp12Protocol.prototype.handleFrame = function(broker, session, request) {
};

