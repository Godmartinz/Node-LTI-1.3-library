const mongoose = require('mongoose');

/*
* Database class to maintain and access Platform information
*/
class Database {

  static async Get(collection, platformSchema, query) {
    let Model = mongoose.model(collection, platformSchema);
    let platformData = [];

    await Model.find(query, (err, registeredPlatform) => {
      if (err) {
        return console.log(`Error finding platform: ${err}`);
      } else {
        platformData = [...registeredPlatform];
      }
    });
    return platformData; 
  };

  static async GetKey(collection, platformSchema, query) {
    let Model = mongoose.model(collection, platformSchema);
    let publicKey;

    await Model.find(query)
    .then(key => {
      publicKey = key[0].kid.publicKey;
    })
    .catch(err => console.log(`Error finding platform ${err}`));

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
