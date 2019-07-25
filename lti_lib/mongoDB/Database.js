const mongoose = require('mongoose');

class Database {

  // TODO: incorperate encryption for stored platform keys.
  static Get(collection, query) {
    let Model = mongoose.model(collection);
    let result = Model.find(query);

    if (result.length === 0) return false
    
    return result;
  };

  // TODO: incorperate encryption for stored platform keys.
  static Insert(collection, platformShema) {
    let Model = mongoose.model(collection, platformShema)

    let newPlatform = new Model(platformShema);
    newPlatform.save();
    return true;
  };

};

module.exports = Database;
