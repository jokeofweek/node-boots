var RequestBuilder = require('../src/requestbuilder.js'),
	b = RequestBuilder.RequestBuilder;

/**
 * Helper function which takes care of converting a string to a buffer and then
 * building a Request out of it.
 */
var getReq = function(str) {
	return RequestBuilder.RequestBuilder(new Buffer(str));
};

// TODO: More tests! 

module.exports = {
	'testRequestBuilderIsExported': function(test) {
		test.ok(RequestBuilder.RequestBuilder, 
			'RequestBuilder.RequestBuilder should be exported.');
		test.done();
	},
	'testHeaderTransformationsIsExported': function(test) {
		test.ok(RequestBuilder.HEADER_TRANSFORMATIONS, 
			'RequestBuilder.HEADER_TRANSFORMATIONS should be exported.');
		test.done();
	},
	'testHeaderTransformationsAreFrozen': function(test) {
		test.ok(Object.isFrozen(RequestBuilder.HEADER_TRANSFORMATIONS),
			'HEADER_TRANSFORMATIONS should be frozen.');
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
			var req = getReq(tests[i][0]);
			test.equals(req.getCommand(), tests[i][1], 
				"Command could not be parsed correctly.");
		}

		test.done();
	},
	'testSimpleHeadersAreExtractedProperly': function(test) {
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
			var req = getReq(tests[i][0]);
			test.deepEqual(req.getHeaders(), tests[i][1], 
				"Header could not be parsed correctly.");
		}

		test.done();
	}
};