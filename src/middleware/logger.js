var sys = require('sys'),
    Middleware = require('./middleware.js');

/**
 * A basic Middleware which logs every event.
 * @constructor
 */
function Logger() {
};
sys.inherits(Logger, Middleware);

/**
 * @override
 */
Logger.prototype.onReceive = function(broker, session, request, next) {
  // Log the request.
  console.log("Received %j from %s.", request, session.getId());
  
  // Move to the next middleware.
  next(broker, session, request);
};

/**
 * @override
 */
Logger.prototype.onSend = function(broker, session, request, callback, next) {
  // Log the request.
  console.log("Sending %j to %s.", request, session.getId());
  // Move to the next middleware.
  next(broker, session, request, callback);
};

module.exports = Logger;