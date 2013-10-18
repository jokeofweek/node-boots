var net = require('net'),
    Broker = require('./src/broker.js'),
    Config = require('./config.js'),
    CommandValidator = require('./src/middleware/commandvalidator.js'),
    Logger = require('./src/middleware/logger.js'),
    SessionFactory = require('./src/sessionfactory.js'),
    Stomp12 = require('./src/middleware/stomp12.js');

// Set up our broker.
var broker = new Broker(new SessionFactory(), new Stomp12());
broker.addMiddleware(new Logger());
broker.addMiddleware(new CommandValidator());

// Set up our server and listen.
var server = net.createServer(broker.getSessionBuilder());
server.listen(Config.PORT);

console.log('Boots Server started on ' + Config.PORT + '.');