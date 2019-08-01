const mongoose = require('mongoose');

class Database {

  static async Get(collection, platformSchema, query) {
    let Model = mongoose.model(collection, platformSchema);
    let platformData = [];

    await Model.find(query, (err, registeredPlatform) => {
      if (err) {
        return console.log(`Error finding platform: ${err}`);
      } else {
        platformData = [registeredPlatform];
      }
    });
    return platformData; 
  };

  static async GetKey(collection, platformSchema, query) {
    let Model = mongoose.model(collection, platformSchema);
    let publicKey = [];

    await Model.find(query, (err, key) => {
      if (err) {
        return console.log(`Error finding public key for: ${query.consumerURL}`);
      } else {
        publicKey = key[0].kid[0];
      }
    });
    return publicKey;
  }

  static Insert(collection, platformSchema, platform) {
    let Model = mongoose.model(collection, platformSchema);

    let newPlatform = new Model(platform);
    newPlatform.save();
    return true;
  };

};

module.exports = Database;
