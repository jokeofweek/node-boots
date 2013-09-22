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
			["CONNECT", "CONNECT\n\n\n\0"],
			["CONNECT", "CONNECT\r\n\n\n\0"],
			["CONNECT", "CONNECT\r\n\r\n\r\n\0"],
			["CONNECT", "CONNECT\nk:v\nk:v\nk:v\n\n\0"],
			["CONNECT", "CONNECT\nk:v\nk:v\nk:v\n\nSome body\\n\\n\0"],
			["ANOTHERCOMMAND", "ANOTHERCOMMAND\n\n\n\0"],
			["ANOTHERCOMMAND", "ANOTHERCOMMAND\r\n\n\n\0"],
			["ANOTHERCOMMAND", "ANOTHERCOMMAND\r\n\r\n\r\n\0"],
			["ANOTHERCOMMAND", "ANOTHERCOMMAND\nk:v\nk:v\nk:v\n\n\0"],
			["ANOTHERCOMMAND", "ANOTHERCOMMAND\nk:v\nk:v\nk:v\n\nSome body\\n\\n\0"]
		];

		for (var i = 0; i < tests.length; i++) {
			var req = getReq(tests[i][1]);
			test.equals(req.getCommand(), tests[i][0], 
				"Command could not be parsed correctly.");
		}

		test.done();
	}
};