var net = require('net'),
    Broker = require('./src/broker.js').Broker,
  	Config = require('./config.js'),
    LoggerMiddleware = require('./src/middleware/logger.js').LoggerMiddleware,
    SessionFactory = require('./src/sessionfactory.js').SessionFactory;

var broker = new Broker(new SessionFactory());
broker.addMiddleware(new LoggerMiddleware());


// Set up our server and listen.
var server = net.createServer(broker.getSessionBuilder());
server.listen(Config.PORT);

console.log('Server started on ' + Config.PORT + '.');