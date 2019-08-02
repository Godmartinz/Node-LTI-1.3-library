const mongoose = require('mongoose');

/*
* Database class to maintain and access Platform information
*/
class Database {

  static async Get(collection, platformSchema, query) {
    let Model = mongoose.model(collection, platformSchema);
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> Gd flow fix (#57)
    let platformData;

      await Model.find(query)
      .then(registeredPlatform => {
        platformData = registeredPlatform;
      })
      .catch(err => console.log(`Error finding platform ${err}`));

      return platformData;

<<<<<<< HEAD
=======
    let platformData = [];

    await Model.find(query, (err, registeredPlatform) => {
      if (err) {
        return console.log(`Error finding platform: ${err}`);
      } else {
        platformData = [...registeredPlatform];
      }
    });
    return platformData; 
>>>>>>> Gd flow fix (#53)
=======
>>>>>>> Gd flow fix (#57)
  };

  static async GetKey(collection, platformSchema, query) {
    let Model = mongoose.model(collection, platformSchema);
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> Gd flow fix (#57)
    let publicKey;

    await Model.find(query)
    .then(key => {
      publicKey = key[0].kid.publicKey;
    })
    .catch(err => console.log(`Error finding platform ${err}`));
<<<<<<< HEAD
=======
    let publicKey = [];

    await Model.find(query, (err, key) => {
      if (err) {
        return console.log(`Error finding public key for: ${query.consumerURL}`);
      } else {
        publicKey = key[0].kid[0];
      }
    });
>>>>>>> Gd flow fix (#53)
=======
>>>>>>> Gd flow fix (#57)
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
