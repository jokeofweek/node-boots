var Request = require('./request.js').Request;

var HEADER_TRANSFORMATIONS = [
	[/\\r/g, '\r'],
	[/\\n/g, '\n'],
	[/\\c/g, ':'],
	[/\\\\/g, '\\']
];

Object.freeze(HEADER_TRANSFORMATIONS);

/**
 * Tries to build a Request object from a Buffer.
 * @param {Buffer} buffer The request buffer.
 * @returns {?Request} A request if one could be built, else null.
 */
RequestBuilder = function(buffer) {
	var command;
	var headers = {};
	var body;

	// First parse out the command.
	var index = 0;
	while (buffer[index] != 10) {
		// Make sure we haven't abruptly hit EOF.
		if (buffer[index] == 0 || index == buffer.length) {
			return null;
		}
		index++;
	}
	// To handle optional \r, do index-1 if it is a \r
	command = buffer.toString('utf8', 0, 
		((buffer[index - 1] == 13) ? index - 1 : index));
	// To move past the index.
	index++;

	// Iterate until we have no more headers (an empty line)
	var startIndex;
	var header;
	var parts;
	var l = HEADER_TRANSFORMATIONS.length;
	while (buffer[index] != 10 && buffer[index] != 13) {
		// Make sure we haven't abruptly hit EOF.
		if (buffer[index] == 0) {
			return null;
		}
		startIndex = index;
		while (buffer[index] != 10 || index == buffer.length) {
			index++;
		}
		// Extract the header
		header = buffer.toString('utf8', startIndex,
			((buffer[index - 1] == 13) ? index - 1 : index));
		// Move past the EOL
		index++;
		// Split it by colon
		parts = header.split(':');
		// If no colon, then it's invalid.
		if (parts.length != 2) {
			return null;
		}
		// Apply all header transformations to the body
		for (var i = 0; i < l; i++) {
			parts[1] = parts[1].replace(HEADER_TRANSFORMATIONS[i][0],
				HEADER_TRANSFORMATIONS[i][1]);
		}
		headers[parts[0]]=parts[1];
		// TODO: Should raise fatal error on undefined escape sequences.
	}

	// If we hit an optional carriage return, move by one
	if (buffer[index] == 13) {
		index++;
	}

	index++;

	// Finaly, extract all the body.
	startIndex = index;
	// Iterate until we hit null (may not be last)
	while (buffer[index] != 0) {
		// Make sure we don't abruptly hit EOF
		if (index == buffer.length) {
			return null;
		}
		index++;
	}
	body = buffer.toString('utf8', startIndex, index);

	return new Request(command, headers, body);
};

module.exports = {
	'RequestBuilder': RequestBuilder,
	'HEADER_TRANSFORMATIONS': HEADER_TRANSFORMATIONS
};