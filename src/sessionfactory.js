var EventEmitter = require('events').EventEmitter;
	Session = require('./session.js').Session,
	SHA256 = require('crypto-js/sha256'),
	sys = require('sys');

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

SessionFactory.prototype.getSession = function(connection) {
	var id = this._sessionId++;
	var session = new Session(connection, SHA256(this._salt + this._sessionId));

	// Setup events.
	var self = this;
	session.on('request', function(request) {
		self.emit('request', session, request);
	});

	return session;
};

module.exports.SessionFactory = SessionFactory;