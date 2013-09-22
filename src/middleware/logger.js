var Middleware = require('./middleware.js').Middleware,
	sys = require('sys');

/**
 * A basic Middleware which logs every event.
 * @constructor
 */
function LoggerMiddleware() {
};
sys.inherits(LoggerMiddleware, Middleware);

/**
 * @override
 */
LoggerMiddleware.prototype.onRequest = function(session, request, next) {
	// Log the request.
	console.log("Received %j from %s.", request, session.getId());
	// Move to the next middleware.
	next(session, request);
};

module.exports.LoggerMiddleware = LoggerMiddleware;