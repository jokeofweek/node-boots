function StringBuffer(maxSize) {
  // Default max size.
  maxSize = maxSize || 65536;
  // Length of what's currently written to the buffer.
  this._length = 0;
  this._buffer = new Buffer(maxSize);
};

/**
 * Appends a buffer to the string.
 * @param  {Buffer} buffer The buffer to append.
 * @return {int} Number of bytes written. Note that this may not be the same
 *                      as the length of the buffer if there is not enough space.
 */
StringBuffer.prototype.append = function(buffer) {
  // Determine how many bytes we can copy over.
  var copyLength = Math.min(buffer.length, this._buffer.length - this._length);
  buffer.copy(this._buffer, this._length, 0, copyLength);
  this._length += copyLength;
  return copyLength;
};

/**
 * Converts the internal buffer to a string.
 * @param  {?string} encoding The encoding to use, else defaults to utf8.
 * @return {string}          The contents of the buffer.
 */
StringBuffer.prototype.toString = function(encoding) {
  return this.toBuffer().toString(encoding || 'utf8')
};

/**
 * Convers the StringBuffer to a buffer object. Note that this buffer should not
 * be mutated.
 * @return {Buffer} A buffer containing the StringBuffer contents.
 **/ 
StringBuffer.prototype.toBuffer = function() {
  return this._buffer.slice(0, this._length);
};

/**
 * Removes characters from the beginning of the buffer.
 * @param  {int} characters Number of characters to remove from the front.
 */
StringBuffer.prototype.trimFront = function(characters) {
  var erased = characters;

  // If we're erasing all characters, then simply reset the length.
  if (this._length <= characters) {
    this._length = 0;
    return;
  }

  // If not, copy over remaining bytes to the front and trim the length.
  this._buffer.copy(this._buffer, 0, characters, this._length);
  this._length -= characters;
};

module.exports.StringBuffer = StringBuffer;