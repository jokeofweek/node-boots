var sys = require('sys'),
    Frame = require('./../frame.js').Frame,
    FrameUtil = require('./../frameutil.js'),
    Middleware = require('./middleware.js').Middleware;

var VALID_ACK_TYPES = {'client': true, 'client-individual': true, 'auto': true};

/**
 * The basic STOMP 1.2 middleware protocol. Only receives requests if the
 * client was actually connected.
 * @constructor
 */
function Stomp12() {
  var commands = [
    'SUBSCRIBE'
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
 * Generates a malofrmed frame received frame.
 * @param  {Frame} request The invalid request the client sent.
 * @param  {string} header The missing header.
 * @return {Frame} The ERROR frame notifying the client.
 * @private
 */
Stomp12.prototype._getMissingHeaderFrame = function(request, header) {
  return new Frame('ERROR', {'message':'malformed frame received'},
        "The message:\n-----\n" + 
        FrameUtil.buildBuffer(request, true).toString('utf8') + 
        "\n-----\nDid not contain a valid " + header + 
        " header, which is REQUIRED\n" + 
        "for " + request.getCommand() + " commands.");
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
  var id;
  var subscription = {
    'ack': 'auto'
  };

  // Try to populate the subscription object.
  // Parse out required ID field.
  if (request.getHeaders()['id']) {
    id = request.getHeaders('id');
  } else {
    // A subscription must have an ID, so return an error.
    console.log(request.getHeaders());
    process.exit(0);
    return;
    session.sendErrorFrame(
      this._getMissingHeaderFrame(request, 'id'));
    return;
  }

  // Parse out required destination
  if (request.getHeaders()['destination']) {
    subscription['destination'] = request.getHeaders()['destination'];
  } else {
    // A subscription must have a destination, so return an error.
    session.sendErrorFrame(
      this._getMissingHeaderFrame(request, 'destination'));
    return;
  }

  // Parse out ack header, making sure it's valid. Ack is optional,
  // so only need to validate if it's there.
  if (request.getHeaders()['ack']) {
    if (VALID_ACK_TYPES[request.getHeaders()['ack']]) {
      subscription['ack'] = request.getHeaders('ack');
    } else {
      session.sendErrorFrame(
        this._getMissingHeaderFrame(request, 'ack'));
      return;
    }
  }

  // Everything is valid, add the subscription!
  session.addSubscription(id, subscription);
};

module.exports.Stomp12 = Stomp12;