var sys = require('sys'),
    EventEmitter = require('events').EventEmitter;

function MockConnection() {
  // Super constructor
  EventEmitter.call(this);
};
sys.inherits(MockConnection, EventEmitter);

module.exports.MockConnection = MockConnection;