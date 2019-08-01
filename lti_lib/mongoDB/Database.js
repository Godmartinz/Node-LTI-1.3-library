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

<<<<<<< HEAD
  static async GetKey(collection, platformSchema, query) {
=======
  static async GetPublicKey(collection, platformSchema, query) {
>>>>>>> dced269c68588d362cbe070992630f6962ee435f
    let Model = mongoose.model(collection, platformSchema);
    let publicKey = [];

    await Model.find(query, (err, key) => {
      if (err) {
        return console.log(`Error finding public key for: ${query.consumerURL}`);
      } else {
<<<<<<< HEAD
        publicKey = key[0].kid[0];
=======
        publicKey = key[0].kid[0].publicKey;
>>>>>>> dced269c68588d362cbe070992630f6962ee435f
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
