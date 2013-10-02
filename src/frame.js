/**
 * This class represents a STOMP frame.
 * @param {string} command  The command for the STOMP frame.
 * @param {?object} headers An optinal map representing headers.
 * @param {?string} body    An optional frame body.
 */
function Frame(command, headers, body) {
  this._command = command;
  this._headers = headers || {};
  this._body = body || "";
};

/**
 * @return {string} The frame's command.
 */
Frame.prototype.getCommand = function() {
  return this._command;
};

/**
 * @return {object} The object representing the frame headers.
 */
Frame.prototype.getHeaders = function() {
  return this._headers;
};

/**
 * Gets the header value for the given key.
 * @param  {string} key Header key.
 * @return {?string} The value for the header or undefined if no such header
 *                       exists.
 */
Frame.prototype.getHeader = function(key) {
  return this._headers[key];
};

/**
 * @return {string} The body of the rame.
 */
Frame.prototype.getBody = function() {
  return this._body;
};

module.exports.Frame = Frame;