var IdFactory = require('./../src/idfactory.js');

module.exports = {
  'testByDefaultReturnsConsecutiveIntegers': function(test) {
    var factory = new IdFactory();
    test.equals(factory.getId(), 1);
    test.equals(factory.getId(), 2);
    test.equals(factory.getId(), 3);
    test.done();
  },
  'testPassesIdToTransformer': function(test) {
    var expected = [1, 2, 3];
    var received = [];
    var factory = new IdFactory(function(id) {
      received.push(id);
      return id;
    });
    test.equals(factory.getId(), 1);
    test.equals(factory.getId(), 2);
    test.equals(factory.getId(), 3);
    test.deepEqual(received, expected);
    test.done();
  },
  'testCanTransformId': function(test) {
    var expected = ['a1', 'b2', 'c3'];
    var factory = new IdFactory(function(id) {
      return String.fromCharCode(97 + (id - 1)) + id;
    });
    test.equals(factory.getId(), expected[0]);
    test.equals(factory.getId(), expected[1]);
    test.equals(factory.getId(), expected[2]);
    test.done();
  }
};