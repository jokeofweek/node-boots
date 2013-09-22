var Session = require('./session.js').Session,
	SHA256 = require('crypto-js/sha256');

function SessionFactory() {
	// Salt to apply for each session ID.
	this._salt = 'fdDZ*%gfd0gk043g0rDSflg43.t43.r/23./.1423;' + process.pid +
		Math.random() + (new Date());

	// Counter to increment for each session.
	this._sessionId = 1;
};

SessionFactory.prototype.getSession = function(connection) {
	var id = this._sessionId++;
	return new Session(connection, SHA256(this._salt + this._sessionId));
};

module.exports.SessionFactory = SessionFactory;