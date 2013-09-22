var Listener = require('./src/listener.js').Listener,
	SessionFactory = require('./src/sessionfactory.js').SessionFactory,
	Config = require('./config.js'),
	net = require('net');

var listener = new Listener(new SessionFactory());

// Set up our server and listen.
var server = net.createServer(listener.getSessionBuilder());
server.listen(Config.PORT);

console.log('Server started on ' + Config.PORT + '.');