var HEADER_TRANSFORMATIONS = [
	[/\\r/g, '\r'],
	[/\\n/g, '\n'],
	[/\\c/g, ':'],
	[/\\\\/g, '\\']
];

function Request(command, headers, body) {
	this._command = command;
	this._headers = headers || {};
	this._body = body || "";
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

module.exports.Request = Request;