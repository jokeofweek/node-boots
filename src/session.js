var events = require('events'),
    util = require('util'),
    FrameUtil = require('./frameutil.js'),
    StringBuffer = require('./stringbuffer.js').StringBuffer;

/**
 * This class represents a client session.
 * @param {Socket} connection The connection to the client.
 * @param {string} id         The session ID.
 * @extends {EventEmitter}
 * @constructor
 */
function Session(connection, id) {
  // Call parent constructor.
  events.EventEmitter.call(this);

  this._connection = connection;
  this._id = id

  // Create a string buffer for the session.
  this._buffer = new StringBuffer();

  // Start out not connected.
  this._connected = false;

  // Set up our set of subscriptions.
  this._subscriptions = {};

  this._setupListeners();

  this.emit('connect');
};
util.inherits(Session, events.EventEmitter);

/**
 * Sets up the event listeners on the connection to pass them to the Session.
 * @private
 */
Session.prototype._setupListeners = function() {
  var self = this;

  this._connection.on('data', function(data) {
    // Add the data to our string buffer, keep on building a frame
    // until we can't.
    self._buffer.append(data);
    var frame;
    while ((frame = FrameUtil.buildFrame(self._buffer))) {
      // Emit an event for each received frame.
      self.emit('receiveData', frame);
    }
  });
  this._connection.on('error', function(error) {
    // Should dispatch to a Middleware.
  });
  this._connection.on('close', function(hadError) {
    // Should dispatch to a Middleware.
  });
};

/**
 * Returns the session ID of this session.
 * @return {string} The ID of the session.
 */
Session.prototype.getId = function() {
  return this._id;
};

/**
 * @return {boolean} whether the session is actually connected or not.
 */
Session.prototype.isConnected = function() {
  return this._connected;
};

/**
 * Updates the status of whether the session is connected or not.
 * @param {boolean} connected whether the session is connected or not.
 */
Session.prototype.setConnected = function(connected) {
  this._connected = connected;
};

/**
 * Sends a frame to the session connection, going through middleware.
 * @param {Frame} response The frame to send.
 * @param {?function} callback An optional callback to call once the frame is sent.
 */
Session.prototype.sendFrame = function(response, callback) {
  this.emit('sendData', response, callback);
};

/**
 * Sends an ERROR frame to the session connection and then closes the connection.
 * @param  {Frame} response The ERROR frame.
 */
Session.prototype.sendErrorFrame = function(response) {
  var self = this;
  this.sendFrame(response, function() {
    self.close();
  });
};

/**
 * Sends a frame directly to the session connection, skipping all middleware.
 * Should only be used by {@link Broker}
 * @param {Frame} response The frame to send.
 * @param {?function} callback An optional callback to call once the frame is sent.
 */
Session.prototype.directSendFrame = function(response, callback) {
  callback = callback || function(){};
  this._connection.write(FrameUtil.buildBuffer(response), 'utf8', callback);
};

/**
 * Closes the session socket.
 */
Session.prototype.close = function() {
  this._connected = false;
  this._connection.end();
};

/**
 * Adds a subscription to the Session.
 * @param {object} subscription The object representing the subscription.
 * @return {boolean} true if the subscription was added, false if a subscription
 *                        already exists with that ID.
 */
Session.prototype.addSubscription = function(subscription) {
  // Adds a subscription if the id doesn't already exist.
  if (!this._subscriptions[subscription.id]) {
    this._subscriptions[subscription.id] = subscription;
    return true;
  } else {
    return false;
  }
};

module.exports.Session = Session;