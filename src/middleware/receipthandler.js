var sys = require('sys'),
    Frame = require('./../frame.js'),
    Middleware = require('./middleware.js');

/**
 * This middleware takes care of sending a RECEIPT frame whenever a frame is
 * succesfully received.
 * @constructor
 */
function ReceiptHandler() {
};
sys.inherits(ReceiptHandler, Middleware);

/**
 * @override
 */
ReceiptHandler.prototype.onReceive = function(broker, session, request, next) {
  if (request.getHeader('receipt')) {
    // Send the receive frame and then process the message.
    session.sendFrame(
      new Frame('RECEIPT', {'receipt-id': request.getHeader('receipt')}),
      function() {
        // Execute the message.
        next(broker, session, request);
      });
  } else {
    // No receipt header, so simply move on.
    next(broker, session, request);  
  }
};

module.exports = ReceiptHandler;