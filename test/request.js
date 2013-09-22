var Request = require('../src/request.js').Request;

module.exports = {
	'testGetters': function(test) {
		var command = "ABC";
		var headers = {k1: "", k2: "abc", k3: "some value"};
		var body = "This is body!";
		var request = new Request(command, headers, body);

		test.deepEqual(request.getCommand(), command);
		test.deepEqual(request.getHeaders(), headers);
		test.deepEqual(request.getBody(), body);

		test.done();
	},
	'testHeadersAreOptional': function(test) {
		var request = new Request("SOME COMMAND.");
		test.deepEqual(request.getHeaders(), {});
		test.done();
	},
	'testBodyOptional': function(test) {
		var request = new Request("SOME COMMAND.");
		test.deepEqual(request.getBody(), "");
		request = new Request("SOME COMMAND.", {a:"", b:""});
		test.deepEqual(request.getBody(), "");
		test.done();
	}
};