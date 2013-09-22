function Broker(sessionFactory) {
	this._sessionFactory = sessionFactory;

	// Listen to events.
	this._sessionFactory.on('data', this._onData.bind(this));
};

Broker.prototype._onData = function(session, request) {
	console.log(request);
};

Broker.prototype.getSessionBuilder = function() {
	return this._sessionFactory.getSession.bind(this._sessionFactory);
};

module.exports.Broker = Broker;