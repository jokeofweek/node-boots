/**
 * This is an interface which supports processing a client frame. Note that this
 * Protocol will only be invoked once a client is connected and has succesfully
 * negotiated a protocol.
 * @constructor
 */
function Protocol() {
};

/**
 * Handles a client frame.
 * @param  {Broker} broker The broker associated with the session.
 * @param  {Session} session The client session.
 * @param  {Frame} request The request frame.
 */
Protocol.prototype.handleFrame = function(broker, session, request) {
};

module.exports.Protocol = Protocol;