var RequestBuilder = require('./requestbuilder.js').RequestBuilder,
	events = require('events'),
	util = require('util');

function Session(connection, sessionId) {
	// Call parent constructor.
	events.EventEmitter.call(this);

	this._connection = connection;
	this._sessionId = sessionId

	this._setupListeners();
};
util.inherits(Session, events.EventEmitter);

Session.prototype._setupListeners = function() {
	var self = this;

	this._connection.on('data', function(data) {
		console.log(RequestBuilder(data));
	});
};

module.exports.Session = Session;