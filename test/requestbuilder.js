var RequestBuilder = require('../src/requestbuilder.js');

module.exports = {
	'testHeaderTransformationsAreFrozen': function(test) {
		test.ok(Object.isFrozen(RequestBuilder.HEADER_TRANSFORMATIONS),
			'HEADER_TRANSFORMATIONS should be frozen.');
		test.done();
	}
};