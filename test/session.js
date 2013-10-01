var Frame = require('./../src/frame.js').Frame,
    FrameUtil = require('./../src/frameutil.js'),
    MockConnection = require('./mock/connection.js').MockConnection,
    Session = require('./../src/session.js').Session;

module.exports = {
  'testSessionGetIdReturnsId': function(test) {
    var connection = new MockConnection();
    var session = new Session(connection, '123');
    test.equals(session.getId(), '123');
    test.done();
  },
  'testSessionCloseCallsEndOnInnerConneciton': function(test) {
    var connection = new MockConnection();
    var session = new Session(connection, '123');
    session.close();
    test.ok(!session.isConnected());
    test.ok(!connection.isConnected());
    test.done();
  },
  'testSessionCloseEmitsCloseEvent': function(test) {
    var session = new Session(new MockConnection(), '123');
    var called = false;
    session.on('close', function() {
      called = true;
    });
    session.close();
    test.ok(called);
    test.done();
  },
  'testConnectionCloseCallsClose': function(test) {
    var connection = new MockConnection()
    var session = new Session(connection, '123');

    var error = {k:1};
    var called = false;
    var receivedError = null;
    session.on('close', function(error) {
      called = true;
      receivedError = error;
    });
    connection.emit('close', error);
    test.ok(called);
    test.equals(receivedError, error);
    test.done();
  },
  'testSessionDirectSendFrameWritesToConnection': function(test) {
    var frame = new Frame("COMMAND", {k: '1', k: '2'}, "BODY");
    var buffer = FrameUtil.buildBuffer(frame);

    var expectedContent = buffer;
    var expectedEncoding = 'utf8';
    var expectedCallback = function(){1+1};

    var receivedContent = null;
    var receivedEncoding = null;
    var receivedCallback = null;

    // Mock out the write function.
    var connection = new MockConnection({
      'write': function(content, encoding, callback) {
        receivedContent = content;
        receivedEncoding = encoding;
        receivedCallback = callback;
      }
    });

    var session = new Session(connection, '123');

    session.directSendFrame(frame, expectedCallback);

    test.deepEqual(receivedContent, expectedContent);
    test.deepEqual(receivedEncoding, expectedEncoding);
    test.deepEqual(receivedCallback, expectedCallback);

    test.done();
  },
  'testSessionSendFrameEmitsSendDataEvent': function(test) {

    var expectedFrame = new Frame("COMMAND", {k: '1', k: '2'}, "BODY");
    var expectedCallback = function(){1+1};
    var receivedFrame = null;
    var receivedCallback = null;

    var session = new Session(new MockConnection(), 123);
    session.on('sendData', function(response, callback) {
      receivedFrame = response;
      receivedCallback = callback;
    });

    session.sendFrame(expectedFrame, expectedCallback);

    test.deepEqual(receivedFrame, expectedFrame);
    test.deepEqual(receivedCallback, expectedCallback);

    test.done();
  },
  'testSessionSendErrorFrameEmitsSendDataEventAndCloses': function(test) {

    var expectedFrame = new Frame("COMMAND", {k: '1', k: '2'}, "BODY");
    var receivedFrame = null;

    var connection = new MockConnection();
    var session = new Session(connection, 123);
    var receivedCallback;
    session.on('sendData', function(response, callback) {
      receivedFrame = response;
      receivedCallback = callback;
      callback();
    });

    session.sendErrorFrame(expectedFrame);

    test.deepEqual(receivedFrame, expectedFrame);
    test.ok(receivedCallback);
    test.ok(!session.isConnected());
    test.ok(!connection.isConnected());

    test.done();
  }
};