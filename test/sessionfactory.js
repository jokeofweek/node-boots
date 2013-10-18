var EventEmitter = require('events').EventEmitter,
    Frame = require('../src/frame.js'),
    MockConnection = require('./mock/connection.js'),
    SessionFactory = require('../src/sessionfactory.js').SessionFactory;

module.exports = {
  'testSessionFactoryAssignsDifferentIdsForNewSessions': function(test) {
    var factory = new SessionFactory();
    var session1 = factory.getSession(new MockConnection());
    var session2 = factory.getSession(new MockConnection());
    var session3 = factory.getSession(new MockConnection());
    test.ok(session1.getId() != session2.getId(),
        "SessionFactory should not re-use session IDs.");
    test.ok(session2.getId() != session3.getId(),
        "SessionFactory should not re-use session IDs.");
    test.ok(session1.getId() != session3.getId(),
        "SessionFactory should not re-use session IDs.");
    test.done();
  },
  'testGetInstanceSetsUpProperEventHandlers': function(test) {
    var factory = new SessionFactory();
    var sentData = false;
    var session = factory.getSession(new MockConnection());

    var receivedSession = null;
    var receivedData = null;
    factory.on('receiveData', function(session, request) {
      receivedSession = session;
      receivedData = request;
    });

    var sentSession = null;
    var sentData = null;
    var sentCallback = null;
    factory.on('sendData', function(session, response, callback) {
      sentSession = session;
      sentData = response;
      sendCallback = callback;
    });


    var closedSession = null;
    var closedError = null;
    factory.on('close', function(session, error) {
      closedSession = session;
      closedError = error;
    });

    var frame = new Frame("COMMAND",{k:'v'},"BODY");
    var aCallback = function() {
      console.log("Some callback.");
    };

    session.emit('receiveData', frame);
    session.emit('sendData', frame, aCallback);
    session.emit('close', aCallback);

    test.equal(receivedSession, session);
    test.equal(receivedData, frame);
    test.equal(sentSession, session);
    test.equal(sentData, frame);
    test.equal(sendCallback, aCallback);
    test.equal(closedSession, session);
    test.equal(closedError, aCallback);

    test.done();

  }
};

