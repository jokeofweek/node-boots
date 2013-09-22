var HEADER_TRANSFORMATIONS = [
	[/\\r/g, '\r'],
	[/\\n/g, '\n'],
	[/\\c/g, ':'],
	[/\\\\/g, '\\']
];

function Request(command, headers, body) {
	this._command = command;
	this._headers = headers || {};
	this._body = body;
};

Request.prototype.getCommand = function() {
	return this._command;
};

Request.prototype.getHeaders = function() {
	return this._headers;
};

Request.prototype.getBody = function() {
	return this._body;
};

Request.build = function(buffer) {
	var command;
	var headers = {};
	var body;

	// First parse out the command.
	var index = 0;
	while (buffer[index] != 10) {
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
	var l = HEADER_TRANSFORMATIONS.length

	while (buffer[index] != 10 && buffer[index] != 13) {
		startIndex = index;
		while (buffer[index] != 10) {
			index++;
		}
		// Extract the header
		header = buffer.toString('utf8', startIndex,
			((buffer[index - 1] == 13) ? index - 1 : index));
		// Move past the EOL
		index++;
		// Split it by colon
		parts = header.split(':');
		console.log("HEADER:" + header);
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
		index++;
	}
	body = buffer.toString('utf8', startIndex, index);

	return new Request(command, headers, body);
};

module.exports.Request = Request;