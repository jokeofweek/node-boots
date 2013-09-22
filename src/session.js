var RequestBuilder = require('./requestbuilder.js').RequestBuilder,
	events = require('events'),
	util = require('util');

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
		var request = RequestBuilder(data);
		// Only emit the data if the request was valid.
		if (request) {
			self.emit('request', request);
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

module.exports.Session = Session;