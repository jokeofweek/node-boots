var sys = require('sys'),
    Frame = require('./../frame.js'),
    Middleware = require('./middleware.js');

var VALID_COMMANDS = {
  'ABORT': true,
  'ACK': true,
  'BEGIN': true,
  'COMMIT': true,
  'CONNECT': true,
  'DISCONNECT': true,
  'NACK': true,
  'SEND': true,
  'SUBSCRIBE': true,
  'UNSUBSCRIBE': true,
};

/**
 * A basic Middleware which validates whether a command contains a valid 
 * command and if not sends an error and closes the connection.
 * 
 * @constructor
 */
function CommandValidator() {
};
sys.inherits(CommandValidator, Middleware);

/**
 * @override
 */
CommandValidator.prototype.onReceive = function(broker, session, request, next) {
  // Make sure request has a valid command.
  if (!VALID_COMMANDS[request.getCommand()]) {
    session.sendErrorFrame(
        new Frame("ERROR", {"message":"invalid command"},
            "The command " + request.getCommand() + " is not defined."));
  } else {
    // Move to the next middleware.
    next(broker, session, request);
  }
};

module.exports = CommandValidator;