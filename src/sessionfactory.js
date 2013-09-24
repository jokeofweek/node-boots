var sys = require('sys'),
    EventEmitter = require('events').EventEmitter;
    Session = require('./session.js').Session,
    SHA256 = require('crypto-js/sha256');

/**
 * This class is responsible for creating new {@link Session} objects based
 * on incoming connections.
 * @constructor
 */
function SessionFactory() {
  // Call parent constructor
  EventEmitter.call(this);

  // Salt to apply for each session ID.
  this._salt = 'fdDZ*%gfd0gk043g0rDSflg43.t43.r/23./.1423;' + process.pid +
    Math.random() + (new Date());

  // Counter to increment for each session.
  this._sessionId = 1;
};
sys.inherits(SessionFactory, EventEmitter);


/**
 * Creates a new Session object to wrap around the connection.
 * @param  {Connection} connection The connection to the client
 * @return {Session} A session wrapped around the connection.
 */
SessionFactory.prototype.getSession = function(connection) {
  var id = this._sessionId++;
  var session = new Session(connection, 
      SHA256(this._salt + this._sessionId).toString());

  // Setup events.
  var self = this;
  session.on('receiveData', function(request) {
    self.emit('receiveData', session, request);
  });
  session.on('sendData', function(request, callback) {
    self.emit('sendData', session, request, callback);
  });
  return session;
};

module.exports.SessionFactory = SessionFactory;