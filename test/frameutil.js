var FrameUtil = require('../src/frameutil.js');

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
	}
};