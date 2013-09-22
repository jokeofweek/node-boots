var sys = require('sys'),
	Middleware = require('./middleware/middleware.js').Middleware;

/**
 * The basic STOMP broker.
 * @param {SessionFactory} sessionFactory The session factory for generating new
 *                                        sessions.
 * @constructor
 */
function Broker(sessionFactory) {
	// Call middleware constructor.
	Middleware.call(this);

	this._sessionFactory = sessionFactory;

	// Keep layers of middleware.
	this._middleware = [];

	// Listen to events.
	var self = this;
	this._sessionFactory.on('request', function(session, request) {
		(self._toNextMethod('onRequest'))(session, request);
	});
};
sys.inherits(Broker, Middleware);


/**
 * Add a layer of middleware to the broker. Note these are executed in order
 * of being added.
 * @param {Middleware} middleware The middleware to add.
 */		
Broker.prototype.addMiddleware = function(middleware) {
	this._middleware.push(middleware);
};

/**
 * Handles the request if no other middleware has handled it.
 * @param  {Session}   session The session that sent the request.
 * @param  {Frame}   request The request that was sent.
 * @param  {Function} next    The next function, should not be called as
 *                            the Broker's onRequest is the last to be called.
 */
Broker.prototype.onRequest = function(session, request, next) {
	console.log("Broker: ");
	console.log(request);
};

/**
 * Gets the function for building a new Session object.
 * @return {function} The function for building a new session.
 */
Broker.prototype.getSessionBuilder = function() {
	return this._sessionFactory.getSession.bind(this._sessionFactory);
};

/**
 * Generates the 'next' function which takes care of iterating through 
 * {@link Middleware} objects and calling the {@link Broker} as a last
 * middleware.
 * 
 * @param  {string} functionName The name of the Middleware function to invoke.
 * @return {function} The function which will execute a function on each 
 *                        Middleware until a value is returned.
 * @private
 */
Broker.prototype._toNextMethod = function(functionName) {
	var self = this;
	var i = 0; 

	var next = function() {
		var middle;
		// If we've executed all middleware, then we use the Broker object
		// as middleware.
		if (i == self._middleware.length) {
			middle = self;
		} else {
			// Get the next middleware.
			middle = self._middleware[i];
			i++;
		}
		// Convert args to array and add next.
		var args = Array.prototype.slice.call(arguments, 0);
		args.push(next);
		return middle[functionName].apply(middle, args);
	}

	return next;
};

module.exports.Broker = Broker;
