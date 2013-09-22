var HEADER_TRANSFORMATIONS = [
	[/\\r/g, '\r'],
	[/\\n/g, '\n'],
	[/\\c/g, ':'],
	[/\\\\/g, '\\']
];

function Frame(command, headers, body) {
	this._command = command;
	this._headers = headers || {};
	this._body = body || "";
};

Frame.prototype.getCommand = function() {
	return this._command;
};

Frame.prototype.getHeaders = function() {
	return this._headers;
};

Frame.prototype.getBody = function() {
	return this._body;
};

module.exports.Frame = Frame;