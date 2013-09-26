var StringBuffer = require('../src/stringbuffer.js').StringBuffer;

module.exports = {

  'testNewBufferIsEmpty': function(test) {
    var buffer = new StringBuffer(100);
    test.equal(buffer.toString(), '');
    test.done();
  },

  'testAppendBuffer': function(test) {
    var buffer = new StringBuffer(36);

    var added = buffer.append(new Buffer('abcdefghijklmnopqrstuvwxyz'));
    test.equal(added, 26);
    test.equal(buffer.toString(), 'abcdefghijklmnopqrstuvwxyz');

    added = buffer.append(new Buffer("12345"));
    test.equal(added, 5);
    test.equal(buffer.toString(), 'abcdefghijklmnopqrstuvwxyz12345');

    // Try to add overwrite to the buffer.
    added = buffer.append(new Buffer('abcdefghijklmnopqrstuvwxyz'));
    test.equal(added, 5);
    test.equal(buffer.toString(), 'abcdefghijklmnopqrstuvwxyz12345abcde');

    // Test that adding to a full buffer does nothing
    added = buffer.append(new Buffer('hello'));
    test.equal(added, 0);
    test.equal(buffer.toString(), 'abcdefghijklmnopqrstuvwxyz12345abcde');

    test.done();
  },

  'testTrimFront': function(test) {
    var buffer = new StringBuffer(26);

    var added = buffer.append(new Buffer('abcdefghijklmnopqrstuvwxyz'));
    buffer.trimFront(26);

    test.equal(added, 26);
    test.equal(buffer.toString(), '');

    // Make sure can re-add after trimming
    var added = buffer.append(new Buffer('abcdefghijklmnopqrstuvwxyz'));
    test.equal(added, 26);
    test.equal(buffer.toString(), 'abcdefghijklmnopqrstuvwxyz');

    buffer.trimFront(5);
  
    test.equal(buffer.toString(), 'fghijklmnopqrstuvwxyz');

    var added = buffer.append(new Buffer('12345'));
    test.equal(added, 5);

    test.equal(buffer.toString(), 'fghijklmnopqrstuvwxyz12345');

    test.done();
  }
};