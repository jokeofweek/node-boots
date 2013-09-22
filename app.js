var net = require('net'),
    Broker = require('./src/broker.js').Broker,
    Config = require('./config.js'),
    CommandValidator = require('./src/middleware/commandvalidator.js').CommandValidator,
    Logger = require('./src/middleware/logger.js').Logger,
    SessionFactory = require('./src/sessionfactory.js').SessionFactory;

var broker = new Broker(new SessionFactory());
broker.addMiddleware(new Logger());
broker.addMiddleware(new CommandValidator());

// Set up our server and listen.
var server = net.createServer(broker.getSessionBuilder());
server.listen(Config.PORT);

console.log('Server started on ' + Config.PORT + '.');