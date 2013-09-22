var events = require('events'),
    util = require('util'),
    FrameUtil = require('./frameutil.js');

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

  // Start out with no version.
  this._version = null;

  this._setupListeners();

  this.emit('connect');
};
util.inherits(Session, events.EventEmitter);

Session.prototype._setupListeners = function() {
  var self = this;

  this._connection.on('data', function(data) {
    var request = FrameUtil.buildFrame(data);
    // Only emit the data if the request was valid.
    if (request) {
      self.emit('receiveData', request);
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
 * @return {?string} The version of STOMP the session is using, else null if not
 *                       connected.
 */
Session.prototype.getVersion = function() {
  return this._version;
};

/**
 * Updates the session version.
 * @param {?string} version The new STOMP version used by the session.
 */
Session.prototype.setVersion = function(version) {
  this._version = verison;
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
  this._connection.end();
};

module.exports.Session = Session;