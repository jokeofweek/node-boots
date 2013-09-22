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
 * @param  {Frame} request The request sent by the session.
 * @param  {Function} next The function for calling the next middleware.
 */
Middleware.prototype.onReceive = function(session, request, next) {
  next(session, request);
};

/**
 * This function is called when a response is sent back to a client.
 * @param  {Session}  session   The session to write to.
 * @param  {Frame}    response  The response to write.
 * @param  {?function} callback The callback to execute once writing is done.
 * @param  {function} next      The function for calling the next middleware
 */
Middleware.prototype.onSend = function(session, response, callback, next) {
  next(session, response, callback || function(){});
};

module.exports.Middleware = Middleware;