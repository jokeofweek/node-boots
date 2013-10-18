var sys = require('sys'),
    EventEmitter = require('events').EventEmitter;

/**
 * This object presents a Mock connection.
 * @param {?object} overrides Optional method overrides,
 */
function MockConnection(overrides) {
  // Super constructor
  EventEmitter.call(this);
  this._connected = true;

  overrides = overrides || {};
  for (var key in overrides) {
    this[key] = overrides[key];
  }
};
sys.inherits(MockConnection, EventEmitter);

/**
 * Ends a connection.
 */
MockConnection.prototype.end = function() {
  this._connected = false;
};

/**
 * @return {Boolean} true if a call has been made to end().
 */
MockConnection.prototype.isConnected = function() {
  return this._connected;
};

module.exports = MockConnection;