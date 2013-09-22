/**
 * This is an interface which represents a layer that the Broker class will 
 * send events through.
 *
 * @constructor
 */
function Middleware() {	
};

/**
 * This function is called when the server receives a request from the server.
 * @param  {Session} session The session that sent the request.
 * @param  {Request} request The request sent by the session.
 * @param  {Function} next The function for calling the next middleware.
 * @return {?Response} The response if there is one.
 */
Middleware.prototype.onRequest = function(session, request, next) {
};

module.exports.Middleware = Middleware;