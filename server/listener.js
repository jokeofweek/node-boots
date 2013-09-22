var SessionFactory = require('./sessionfactory.js').SessionFactory;

function Listener(sessionFactory) {
	this._sessionFactory = sessionFactory;
};

Listener.prototype.getSessionBuilder = function() {
	return this._sessionFactory.getSession.bind(this._sessionFactory);
};

module.exports.Listener = Listener;