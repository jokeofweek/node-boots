/**
 * This class generates unique IDs. By default they are a sequential list of
 * numbers although a transformer can be passed which accepts the id and returns
 * a transformed ID.
 *  
 * @param {function(int):object?} transformer An optional function which should
 *                                            accept the generated ID and 
 *                                            transform it. Optional - by default
 *                                            simply returns the generated ID.
 */
function IdFactory(transformer) {
  this._id = 1;
  this._transformer = transformer || function(id) {
    return id;
  };
};

/**
 * Returns the next unique ID.
 * @return {?} A unqiue ID.
 */
IdFactory.prototype.getId = function() {
  // Builds the ID to send back.
  var id = this._transformer(this._id);
  // Move up id counter.
  this._id++;

  return id;
};

module.exports = IdFactory;