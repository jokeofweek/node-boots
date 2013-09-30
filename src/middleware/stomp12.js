var sys = require('sys'),
    Frame = require('./../frame.js').Frame,
    FrameUtil = require('./../frameutil.js'),
    Middleware = require('./middleware.js').Middleware;

var VALID_ACK_TYPES = {'client': true, 'client-individual': true, 'auto': true};

// TODO: Move subscriptions to broker.

/**
 * The basic STOMP 1.2 middleware protocol. Only receives requests if the
 * client was actually connected.
 * @constructor
 */
function Stomp12() {
  var commands = [
    'SUBSCRIBE',
    'UNSUBSCRIBE'
  ];
  // Map each command to the equivalent method. Currently a command's method
  // is just the command name lower cased prefixed by an underscore.
  this._commands = {};
  for (var i = 0; i < commands.length; i++) {
    this._commands[commands[i]] = '_' + commands[i].toLowerCase();
  }
};
sys.inherits(Stomp12, Middleware);

/**
 * @override
 */
Stomp12.prototype.onReceive = function(broker, session, request, next) {
  var handler = this._commands[request.getCommand()];
  // If we didn't find a command handler (ie. non-existing command) then just
  // return an error.
  if (!this[handler]) {
    session.sendErrorFrame(
        new Frame("ERROR", {"message":"invalid command"},
            "The command " + request.getCommand() + " is not defined."));
  } else {
    this[handler](broker, session, request);
  }
};

/**
 * Generates a "malformed frame received" frame.
 * @param {Frame} request The invalid request the client sent.
 * @param {string} header The missing header.
 * @param {?string} message An optional message to send to the client. If the
 *                          message is not specified, a generic message is sent
 *                          saying the frame did not contain a valid header.
 * @return {Frame} The ERROR frame notifying the client.
 * @private
 */
Stomp12.prototype._getHeaderErrorFrame = function(request, header, message) {
  message = message || "Did not contain a valid " + header + 
        " header, which is REQUIRED\n" +
        "for " + request.getCommand() + " commands";
  return new Frame('ERROR', {'message':'malformed frame received'},
        "The message:\n-----\n" + 
        FrameUtil.buildBuffer(request, true).toString('utf8') + 
        "\n-----\n" + message);
};

/**
 * Handles a SUBSCRIBE frame.
 * @param  {Broker} broker The broker.
 * @param  {Session} session The session that sent the frame.
 * @param  {Frame} request The frame that was sent.
 * @private
 */
Stomp12.prototype._subscribe = function(broker, session, request) {
  // By default a subscription has ack = auto.
  var subscription = {
    'ack': 'auto'
  };

  // Try to populate the subscription object.
  // Parse out required ID field.
  if (request.getHeaders()['id']) {
    subscription['id'] = request.getHeaders()['id'];
  } else {
    // A subscription must have an ID, so return an error.
    session.sendErrorFrame(
      this._getHeaderErrorFrame(request, 'id'));
    return;
  }

  // Parse out required destination
  if (request.getHeaders()['destination']) {
    subscription['destination'] = request.getHeaders()['destination'];
  } else {
    // A subscription must have a destination, so return an error.
    session.sendErrorFrame(
      this._getHeaderErrorFrame(request, 'destination'));
    return;
  }

  // Parse out ack header, making sure it's valid. Ack is optional,
  // so only need to validate if it's there.
  if (request.getHeaders()['ack']) {
    if (VALID_ACK_TYPES[request.getHeaders()['ack']]) {
      subscription['ack'] = request.getHeaders()['ack'];
    } else {
      session.sendErrorFrame(
        this._getHeaderErrorFrame(request, 'ack',
            'Did not contain a valid ack header. Either the header must not ' +
            'be present or the value must be one of auto, client, or ' + 
            'client-individual.'));
      return;
    }
  }

  // Everything is valid, try to add the subscription, notifying the client
  // if a subscription already exists with that id.
  if (!session.addSubscription(subscription)) {
    session.sendErrorFrame(
      this._getHeaderErrorFrame(request, 'id', 
         'Described a subscription with an ID that is already in use.'));
  }
};

/**
 * Handles an UNSUBSCRIBE frame.
 * @param  {Broker} broker The broker.
 * @param  {Session} session The session that sent the frame.
 * @param  {Frame} request The frame that was sent.
 * @private
 */
Stomp12.prototype._unsubscribe = function(broker, session, request) {
  // Make sure we have an ID header else send an error.
  if (!request.getHeaders()['id']) {
    session.sendErrorFrame(
      this._getHeaderErrorFrame(request, 'id'));
    return;
  }

  // Simply remove the subscription.
  session.removeSubscription(request.getHeaders()['id']);
};

module.exports.Stomp12 = Stomp12;