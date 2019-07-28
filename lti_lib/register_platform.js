const mongoose = require('mongoose');
const Database = require('./mongoDB/Database.js');
const { keyGenerator } = require('./keyGenerator.js');
const Schema = mongoose.Schema;

const platformSchema = new Schema({
  consumerUrl: String,
  consumerName: String,
  consumerClientID: String,
  consumerAuthorizationURL: String,
  consumerAccessTokenURL: String,
  kid: Array,
  consumerAuthorizationconfig: {
    method: String,
    key: String
  }
});

const registerPlatform = async (
  consumerUrl, /* Base url of the LMS. */
  consumerName, /* Name of the LMS. */
  consumerClientID, /* Client ID created from the LMS. */
  consumerAuthorizationURL, /* URL that the LMS redirects to launch the tool. */
  consumerAccessTokenURL, /* URL that the LMS redirects to obtain an access token/login . */
  consumerAuthorizationconfig, /* Authentication method and key for verifying messages from the platform. {method: "RSA_KEY", key:"PUBLIC KEY..."} */
) => {
  if ( !consumerUrl || !consumerName || !consumerClientID || !consumerAuthorizationURL || !consumerAccessTokenURL || !consumerAuthorizationconfig ) {
    console.log('Error: registerPlatform function is missing argument.');
  };
  let existingPlatform = await Database.Get('platforms', platformSchema, { consumerUrl: consumerUrl });

  //checks database for existing platform.
  if (existingPlatform.length === 1) {
    return existingPlatform;
  } else {
    const keyPairs = keyGenerator();

    // .Insert() method accepts ('platforms', platformSchema { consumerUrl: consumerUrl, ...})
    Database.Insert('platforms', platformSchema, { 
      'consumerUrl': consumerUrl,
      'consumerName': consumerName,
      'consumerClientID': consumerClientID,
      'consumerAuthorizationURL': consumerAuthorizationURL,
      'consumerAccessTokenURL': consumerAccessTokenURL,
      'kid': keyPairs,
      'consumerAuthorizationconfig': consumerAuthorizationconfig,
    });
    return console.log(`Platform registered at: ${consumerUrl}`);
  };
  
};

module.exports = { registerPlatform };
