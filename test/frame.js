var Frame = require('../src/frame.js');

module.exports = {
  'testGetters': function(test) {
    var command = "ABC";
    var headers = {k1: "", k2: "abc", k3: "some value"};
    var body = "This is body!";
    var frame = new Frame(command, headers, body);

    test.deepEqual(frame.getCommand(), command);
    test.deepEqual(frame.getHeaders(), headers);
    test.deepEqual(frame.getBody(), body);

    test.done();
  },
  'testHeadersAreOptional': function(test) {
    var frame = new Frame("SOME COMMAND.");
    test.deepEqual(frame.getHeaders(), {});
    test.done();
  },
  'testBodyOptional': function(test) {
    var frame = new Frame("SOME COMMAND.");
    test.deepEqual(frame.getBody(), "");
    frame = new Frame("SOME COMMAND.", {a:"", b:""});
    test.deepEqual(frame.getBody(), "");
    test.done();
  },
  'testGetHeader': function(test) {
    var frame = new Frame("SOME COMMAND", {"a":"1", "b":"2"});
    var tests = [
      ['a', '1'],
      ['b', '2'],
      ['c', undefined],
      ['', undefined]
    ];

    for (var i = 0; i < tests.length; i++) {
      test.deepEqual(frame.getHeader(tests[i][0]), tests[i][1]);
    }
    test.done();
  }
};