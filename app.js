var Broker = require('./src/broker.js').Broker,
	SessionFactory = require('./src/sessionfactory.js').SessionFactory,
	Config = require('./config.js'),
	net = require('net');

var broker = new Broker(new SessionFactory());

// Set up our server and listen.
var server = net.createServer(broker.getSessionBuilder());
server.listen(Config.PORT);

console.log('Server started on ' + Config.PORT + '.');