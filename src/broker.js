var sys = require('sys'),
    Config = require('./../config.js'),
    Frame = require('./frame.js').Frame;
    Middleware = require('./middleware/middleware.js').Middleware;

var SERVER_VERSION = '1.2';
var SERVER_VERSION_MISMATCH_FRAME = new Frame(
  'ERROR',
  {
    version: SERVER_VERSION,
    message: "server accepts version " + SERVER_VERSION
  },
  "Supported protocol versions are " + SERVER_VERSION
);

/**
 * The basic STOMP broker.
 * @param {SessionFactory} sessionFactory The session factory for generating new
 *                                        sessions.
 * @constructor
 * @extends {Middleware}
 */
function Broker(sessionFactory) {
  // Call middleware constructor.
  Middleware.call(this);

  this._sessionFactory = sessionFactory;

  // Keep layers of middleware.
  this._middleware = [];

  // Listen to events.
  var self = this;
  this._sessionFactory.on('receiveData', function(session, request) {
    (self._toNextMethod('onReceive'))(session, request);
  });
  this._sessionFactory.on('sendData', function(session, request, callback) {
    (self._toNextMethod('onSend'))(session, request, callback);
  });
};
sys.inherits(Broker, Middleware);


/**
 * Add a layer of middleware to the broker. Note these are executed in order
 * of being added.
 * @param {Middleware} middleware The middleware to add.
 */    
Broker.prototype.addMiddleware = function(middleware) {
  this._middleware.push(middleware);
};

/**
 * @override
 */
Broker.prototype.onReceive = function(session, request, next) {
  // If the session is not yet connected, must check for that.
  if (!session.isConnected()) {
    if (request.getCommand() == 'CONNECT' || request.getCommand() == 'STOMP') {
      // TODO: Take host header into consideration.
      // Parse out the accepted versions. Note that accept-version is not
      // obligatory for 1.0, so no header means 1.0. If we used STOMP, then
      // the client is 1.2.
      this._processConnectionHeaders(request);
      if (this.canAcceptServerVersion(request.getHeaders()['accept-version'])) {
        var connectedHeaders = {
          version: SERVER_VERSION,
          server: Config.SERVER,
          session: session.getId(),
          'heart-beat': '0,0'
        };        

        session.sendFrame(new Frame("CONNECTED", connectedHeaders));
        session.setConnected(true);
      } else {
        session.sendErrorFrame(SERVER_VERSION_MISMATCH_FRAME);
      }
    } else {
      session.sendErrorFrame(new Frame("ERROR", {message: "not connected yet."},
        "The command " + request.getCommand() + " can not be executed before " +
        "being connected."));
    }
  }
};

/**
 * @override
 */
Broker.prototype.onSend = function(session, response, callback, next) {
  // Sends directly to the session.
  session.directSendFrame(response, callback);
};

/**
 * Gets the function for building a new Session object.
 * @return {function} The function for building a new session.
 */
Broker.prototype.getSessionBuilder = function() {
  return this._sessionFactory.getSession.bind(this._sessionFactory);
};

/**
 * Checks whether comma-seperated list of versions sent by the client contains
 * the server version ({@link #SERVER_VERSION}).
 * @param  {string} acceptedVersions comma-seperated list of versions
 * @return {boolean} true if SERVER_VERSION is one of the versions in the list.
 */
Broker.prototype.canAcceptServerVersion = function(acceptedVersions) {
  // Versions seperated by CSV.
  var versions = acceptedVersions.split(',');
  for (var i = 0; i < versions.length; i++) {
    if (versions[i] == SERVER_VERSION) {
      return true;
    }
  }
  return false;
};

/**
 * Generates the 'next' function which takes care of iterating through 
 * {@link Middleware} objects and calling the {@link Broker} as a last
 * middleware.
 * 
 * @param  {string} functionName The name of the Middleware function to invoke.
 * @return {function} The function which will execute a function on each 
 *                        Middleware until a value is returned.
 * @private
 */
Broker.prototype._toNextMethod = function(functionName) {
  var self = this;
  var i = 0; 

  var next = function() {
    var middle;
    // If we've executed all middleware, then we use the Broker object
    // as middleware.
    if (i == self._middleware.length) {
      middle = self;
    } else {
      // Get the next middleware.
      middle = self._middleware[i];
      i++;
    }
    // Convert args to array and add next.
    var args = Array.prototype.slice.call(arguments, 0);
    args.push(next);
    return middle[functionName].apply(middle, args);
  }

  return next;
};

/**
 * This helper function updates a connection frame to include any headers which 
 * may be missing. An example of this is injecting a accept-version header for 
 * CONNECT frames that are missing this. 
 * @param  {frame} frame The frame to update.
 * @private
 */
Broker.prototype._processConnectionHeaders = function(frame) {
  var headers = frame.getHeaders();

  // Temporary hack - some clients send accepted-version.
  // TODO: Remove temporary hack once https://github.com/gdaws/node-stomp/pull/5 is implemented.
  if (!headers['accept-version'] && headers['accepted-version']) {
    headers['accept-version'] = headers['accepted-version'];
  }

  if (frame.getCommand() == 'STOMP') {
    // No accept-version on STOMP means 1.2
    headers['accept-version'] = headers['accept-version'] || '1.2';
  } else if (frame.getCommand() == 'CONNECT') {
    // No accept-version on CONNECT means 1.0
    headers['accept-version'] = headers['accept-version'] || '1.0';
  }

  // For no heart-beat, assume 0,0
  headers['heart-beat'] = headers['heart-beat'] || '0,0';
};


module.exports.Broker = Broker;
