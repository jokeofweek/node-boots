var Frame = require('./Frame.js').Frame;

var BUFFER_TO_FRAME_TRANSFORMATIONS = [
  [/\\r/g, '\r'],
  [/\\n/g, '\n'],
  [/\\c/g, ':'],
  [/\\\\/g, '\\']
];

var FRAME_TO_BUFFER_TRANSFORMATIONS = [
  [/\\/g, "\\\\"],
  [/:/g, "\\c"],
  [/\r/g, "\\r"],
  [/\n/g, "\\n"]
];

// TODO: Should allow for adding to a buffer if a Frame is incomplete.
// TODO: Allow for content-length.

/**
 * Tries to build a Frame object from a Buffer.
 * @param {Buffer} buffer The Frame buffer.
 * @returns {?Frame} A Frame if one could be built, else null.
 */
function buildFrame(buffer) {
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
  var l = BUFFER_TO_FRAME_TRANSFORMATIONS.length;
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

    // Make sure we haven't already used that key, as according to RFC
    // SHOULD only use first value.
    if (!headers[parts[0]]) {
      headers[parts[0]]=applyTransformations(parts[1], 
          BUFFER_TO_FRAME_TRANSFORMATIONS);
    } 
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

  return new Frame(command, headers, body);
};

/**
 * Builds a Buffer object containing the string representation of a frame.
 * @param  {Frame} frame The frame to convert.
 * @return {?Buffer} The buffer if it could be converted, else null.
 */
function buildBuffer(frame) {
  // Add command
  var str = frame.getCommand() + "\n";

  // Iterate throug headers.
  var headers = frame.getHeaders();
  for (var key in headers) {
    str += applyTransformations('' + key, FRAME_TO_BUFFER_TRANSFORMATIONS) + 
      ":" + applyTransformations('' + headers[key], FRAME_TO_BUFFER_TRANSFORMATIONS) + 
      "\n";
  }
  str += "\n";

  // Add body
  if (frame.getBody()) {
    str += frame.getBody();
  }

  // Add null char.
  str += "\0";

  return new Buffer(str, 'utf8');
};

/**
 * Applies a set of transformations to a string.
 * @param  {string} str    The string to transform
 * @param  transformations The set of transformations
 * @return {string}        The transformed string.
 */
function applyTransformations(str, transformations) {
  for (var i = 0, l = transformations.length; i < l; i++) {
    str = str.replace(transformations[i][0], transformations[i][1]);
  }
  return str;
};

module.exports.buildFrame = buildFrame;
module.exports.buildBuffer = buildBuffer;