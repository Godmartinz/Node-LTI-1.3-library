require('dotenv').config();

/* 
 * Validate LTI 1.3 OAuth2 Client Credentials Request
 * @param req - HTTP request to validate
 * @returns an array, which if empty indicates 0 errors, otherwise, contains description of each error
*/
function valid_oauth2_request(req) {
  let body = req.body;
  let errors = [];

  // Check it is a POST request
  if (req.method !== 'POST') {
    errors.push('Method invalid');
  };

  // Check the data exists
  if (Object.entries(body).length === 0 && body.constructor === Object) {
    errors.push('body data missing');
  } else {
    // Check the grant type
    if (!body.hasOwnProperty('grant_type')) {
      errors.push('grant type missing')
    } else {
      if (body.grant_type !== 'client_credentials') {
        errors.push('grant type invalid')
      }
    }

    // Check the client_id
    // TODO:  We should have a database of valid client_ids
    if (!body.hasOwnProperty('client_id')) {
      errors.push('client id missing')
    } else {
      if (body.client_id !== process.env.CLIENT_ID) {
        errors.push('client id invalid')
      }
    }

    // Check the client_secret
    // TODO:  We need to connect client_id with their secret
    if (!body.hasOwnProperty('client_secret')) {
      errors.push('client secret missing')
    } else {
      if (body.client_secret !== process.env.CLIENT_SECRET) {
        errors.push('client secret invalid')
      }
    }
  }
  
  return errors;
}


module.exports = { valid_oauth2_request };
