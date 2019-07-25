const mongoose = require('mongoose');
mongoose.set('CreateIndex', true);
const Database = require('./mongoDB/Database.js');
const Schema = mongoose.Schema;

const platformSchema = new Schema({
  consumerUrl: String,
  consumerName: String,
  consumerClientID: String,
  consumerAuthorizationURL: String,
  consumerAccessTokenURL: String,
  consumerAuthorizationconfig: {
    method: String,
    key: String
  }
});

const registerPlatform = (
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


  // let existingPlatform = Database.Get('platform', { consumerUrl: consumerUrl });
  // console.log(existingPlatform);
  
  Database.Insert('platform', { 
    consumerUrl: consumerUrl,
    consumerName: consumerName,
    consumerClientID: consumerClientID,
    consumerAuthorizationURL: consumerAuthorizationURL,
    consumerAccessTokenURL: consumerAccessTokenURL,
    consumerAuthorizationconfig: consumerAuthorizationconfig,
  });

};

module.exports = { registerPlatform };
