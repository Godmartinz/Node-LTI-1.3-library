const mongoose = require('mongoose');

class Database {

  // TODO: incorperate encryption for stored platform keys.
  static async Get(collection, platformSchema, query) {
    let Model = mongoose.model(collection, platformSchema);
    let platformData = [];
    
    await Model.find(query, (err, registeredPlatform) => {
      if (err) {
        return console.log(`Error Finding platform: ${err}`);
      } else {
        platformData = [...registeredPlatform];
      }
    });
    return platformData;
  };

  // TODO: incorperate encryption for stored platform keys.
  static Insert(collection, platformSchema, platform) {
    let Model = mongoose.model(collection, platformSchema);

    let newPlatform = new Model(platform);
    newPlatform.save();
    return true;
  };

};

module.exports = Database;
