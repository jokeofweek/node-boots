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

Frame.prototype.getCommand = function() {
  return this._command;
};

Frame.prototype.getHeaders = function() {
  return this._headers;
};

Frame.prototype.getBody = function() {
  return this._body;
};

module.exports.Frame = Frame;