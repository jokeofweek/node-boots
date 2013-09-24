var Frame = require('./../src/frame.js').Frame,
    FrameUtil = require('./../src/frameutil.js'),
    MockConnection = require('./mock/connection.js').MockConnection,
    Session = require('./../src/session.js').Session;

// TODO: Test sendFrame/sendError!

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
  }
};