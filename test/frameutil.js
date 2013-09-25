var Frame = require('../src/frame.js').Frame,
    FrameUtil = require('../src/frameutil.js');


/**
 * Helper function which takes care of converting a string to a buffer and then
 * building a Frame out of it.
 */
var getFrame = function(str) {
  return FrameUtil.buildFrame(new Buffer(str));
};

// TODO: More tests! 

module.exports = {
  'testBuildFrameIsExported': function(test) {
    test.ok(FrameUtil.buildFrame, 
      'FrameUtil.buildFrame should be exported.');
    test.done();
  },
  'testBuildBufferIsExported': function(test) {
    test.ok(FrameUtil.buildBuffer, 
      'FrameUtil.buildBuffer should be exported.');
    test.done();
  },
  'testCommandIsExtractedProperly': function(test) {
    var tests = [
      ["CONNECT\n\n\n\0", "CONNECT"],
      ["CONNECT\r\n\n\n\0", "CONNECT"],
      ["CONNECT\r\n\r\n\r\n\0", "CONNECT"],
      ["CONNECT\nk:v\nk:v\nk:v\n\n\0", "CONNECT"],
      ["CONNECT\nk:v\nk:v\nk:v\n\nSome body\\n\\n\0", "CONNECT"],
      ["ANOTHERCOMMAND\n\n\n\0", "ANOTHERCOMMAND"],
      ["ANOTHERCOMMAND\r\n\n\n\0", "ANOTHERCOMMAND"],
      ["ANOTHERCOMMAND\r\n\r\n\r\n\0", "ANOTHERCOMMAND"],
      ["ANOTHERCOMMAND\nk:v\nk:v\nk:v\n\n\0", "ANOTHERCOMMAND"],
      ["ANOTHERCOMMAND\nk:v\nk:v\nk:v\n\nSome body\\n\\n\0", "ANOTHERCOMMAND"]
    ];

    for (var i = 0; i < tests.length; i++) {
      var req = getFrame(tests[i][0]);
      test.equals(req.getCommand(), tests[i][1], 
        "Command could not be parsed correctly.");
    }

    test.done();
  },
  'testSimpleValidHeadersAreExtractedProperly': function(test) {
    var tests = [
      ["CONNECT\n\n\n\0", {}],
      ["CONNECT\nk:\n\n\n\0", {k:''}],
      ["CONNECT\nk:\nk2:\n\n\0", {k:'', k2:''}],
      ["CONNECT\nk:v\n\n\n\0", {k:'v'}],
      ["CONNECT\nk:v\nk2:v2\n\n\0", {k:'v', k2: 'v2'}],
      ["CONNECT\nk:v\nk2:\nk3:v3\nk4:v4\nk5:\n\n\0", 
        {k:'v', k2: '', k3: 'v3', k4: 'v4', k5: ''}],
      ["CONNECT\r\n\r\n\r\n\0", {}],
      ["CONNECT\r\nk:\r\n\r\n\r\n\0", {k:''}],
      ["CONNECT\r\nk:\r\nk2:\r\n\r\n\0", {k:'', k2:''}],
      ["CONNECT\r\nk:v\r\n\r\n\r\n\0", {k:'v'}],
      ["CONNECT\r\nk:v\r\nk2:v2\r\n\r\n\0", {k:'v', k2: 'v2'}],
      ["CONNECT\r\nk:v\r\nk2:\r\nk3:v3\r\nk4:v4\r\nk5:\r\n\r\n\0", 
        {k:'v', k2: '', k3: 'v3', k4: 'v4', k5: ''}]
    ];

    for (var i = 0; i < tests.length; i++) {
      var req = getFrame(tests[i][0]);
      test.deepEqual(req.getHeaders(), tests[i][1], 
        "Header could not be parsed correctly.");
    }

    test.done();
  },
  'testOnlyFirstValueUsedForRepeatedKeys': function(test) {
    var tests = [
      ["CONNECT\nk:1\nk:2\n\n\0", {k:1}],
      ["CONNECT\nk:1\nk:2\nk:3\n\n\0", {k:1}],
      ["CONNECT\nk2:5\nk:1\nk2:1\nk:2\nk:3\n\n\0", {k:1, k2:5}]
    ];

    for (var i = 0; i < tests.length; i++) {
      var req = getFrame(tests[i][0]);
      test.deepEqual(req.getHeaders(), tests[i][1], 
        "Headers with repeated keys should only use first appearance.");
    }

    test.done();
  },
  'testErroneousHeadersReturnNull': function(test) {
    var tests = [
      "CONNECT\0",
      "CONNECT\n\0",
      "CONNECT\r\n\0",
      "CONNECT",
      "CONNECT\n\n\n",
      "CONNECT\r\n\r\n\r\n",
      "CONNECT\nk\n\n\0" /* Invalid key:value format */,
      "CONNECT\nk:v\nk2\n\n\0" /* Invalid key:value format */,  
      "CONNECT\r\nk\r\n\r\n\0" /* Invalid key:value format */,
      "CONNECT\r\nk:v\r\nk2\r\n\r\n\0" /* Invalid key:value format */,
      "\0",
      ""
    ];

    for (var i = 0; i < tests.length; i++) {
      var req = getFrame(tests[i]);
      test.equals(req, null, 
        "Header should not be parsed correctly and should return null.");
    }

    test.done();
  },
  'testBuildFrameTakesContentLengthIntoConsideration': function(test) {
    var tests = [
      ["12345", "C\ncontent-length:5\n\n12345\0"],
      ["", "C\ncontent-length:0\n\n\0"],
      ["\0"+"12345", "C\ncontent-length:6\n\n\0"+"12345\0"]
    ];

    for (var i = 0; i < tests.length; i++) {
      var req = getFrame(tests[i][1]);
      test.equals(req.getBody(), tests[i][0]);
    }

    test.done();
  },
  'testBuildFrameWithInvalidContentLengthReturnsNull': function(test) {
    var tests = [ 
      "C\ncontent-length:1\n\n\0",
      "C\ncontent-length:5\n\n12345",
      "C\ncontent-length:999\n\n\0",
      "C\ncontent-length:5\n\n123456\0"
    ];

    for (var i = 0; i < tests.length; i++) {
      var req = getFrame(tests[i]);
      test.equals(req, null);
    }
    test.done();
  },
  'testBuildBufferGeneratesForCommandOnly': function(test) {
    var str = "COMMAND\n\n\0"
    var frame = new Frame("COMMAND");
    test.deepEqual(FrameUtil.buildBuffer(frame).toString('utf8'),
      str);
    test.done();
  },
  'testBuildBufferGeneratesForSimpleKeyValues': function(test) {
    var str = "COMMAND\nk:v\nk1:\nk2:v2\nk3:5\n\n\0"
    var frame = new Frame("COMMAND", {
      k: "v", k1: "", k2: "v2", k3: 5
    });
    test.deepEqual(FrameUtil.buildBuffer(frame).toString('utf8'),
      str);
    test.done();
  },
  'testBuildBufferGeneratesForBody': function(test) {
    var str = "COMMAND\nk:v\nk1:\nk2:v2\n\nBODY\nBODYCONT\0"
    var frame = new Frame("COMMAND", {
      k: "v", k1: "", k2: "v2"
    }, "BODY\nBODYCONT");
    test.deepEqual(FrameUtil.buildBuffer(frame).toString('utf8'),
      str);
    test.done();
  },
  'testBuildBufferEscapesCharactersInHeadersOnly': function(test) {
    var tests = [
      [new Frame("C", {"a:b:":"c:d"}, "BO:DY"), "C\na\\cb\\c:c\\cd\n\nBO:DY\0"],
      [new Frame("C", {"a\\b\\:":"c\\d"}, "BO\\DY"), "C\na\\\\b\\\\\\c:c\\\\d\n\nBO\\DY\0"],
      [new Frame("C", {"\na\nb:":"cd\n\n"}, "BO\nDY"), "C\n\\na\\nb\\c:cd\\n\\n\n\nBO\nDY\0"],
      [new Frame("C", {"\ra\rb:":"cd\\\r\r"}, "BO\nDY"), "C\n\\ra\\rb\\c:cd\\\\\\r\\r\n\nBO\nDY\0"]
    ];

    for (var i = 0; i < tests.length; i++) {
      test.deepEqual(FrameUtil.buildBuffer(tests[i][0]).toString('utf8'),
        tests[i][1]);    
    }
    test.done();
  }
};