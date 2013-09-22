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
};

/**
 * Returns the session ID of this session.
 * @return {string} The ID of the session.
 */
Session.prototype.getId = function() {
  return this._id;
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

module.exports.Session = Session;