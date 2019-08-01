require('dotenv').config();
// const Database = require('./mongoDB/Database.js');
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const platformSchema = new Schema({
//   consumerUrl: String,
//   consumerName: String,
//   consumerToolClientID: String,
//   consumerAuthorizationURL: String,
//   consumerAccessTokenURL: String,
//   consumerRedirect_URI: String,
//   kid: Array,
//   consumerAuthorizationconfig: {
//     method: String,
//     key: String
//   }
// });

/*
* Validates OIDC login request.  Checkes required parameters are present.
* @param req - OIDC login request sent from LMS to Tool
* @returns array of errors, if empty then request is valid
*/
function is_valid_oidc_login(req) {
  let errors = [];
  if (!req.body.hasOwnProperty('iss')) {
    errors.push('Issuer missing');
  }
  if (!req.body.hasOwnProperty('login_hint')) {
    errors.push('Login hint missing');
  }
  if (!req.body.hasOwnProperty('target_link_uri')) {
    errors.push('Target Link URI missing');
  }
  return errors;
}

/* 
* Validate OIDC login and construct response for valid logins.  Looks up Issuer in database to ensure they are registered
* with the Tool.
* @param req - req sent from OIDC to Tool's OIDC login endpoint
* @returns if valid request, returns properly formated response object
* @return if invalid request, returns array of errors with the request
*/
function create_oidc_response(req) {
  console.log('req in createOIDC func:')
  console.log(req) // take out
  const errors = is_valid_oidc_login(req);

  if (errors.length === 0 && req.session.platform_DBinfo) {
    let response = {
      scope: 'openid',
      response_type: 'id_token',
      client_id: req.session.platform_DBinfo.consumerToolClientID,
      redirect_uri: req.session.platform_DBinfo.consumerRedirect_URI,
      login_hint: req.body.login_hint,
      state: create_unique_string(30, true),
      response_mode: 'form_post',
      nonce: create_unique_string(25, false),
      prompt: 'none'
    };

    if (req.body.hasOwnProperty('lti_message_hint')) {
      response = {
        ...response,
        lti_message_hint: req.body.lti_message_hint,
      };
    }
    return response;
  } else if (!req.session.platform_DBinfo) {
    errors.push('Issuer invalid: not registered');
  }
  return errors;
}

/*
* Create a long, unique string consisting of upper and lower case letters and numbers.
* @param length - desired length of string
* @param signed - boolean whether string should be signed with Tool's private key
* @returns unique string
*/
function create_unique_string(length, signed) {
  let unique_string = '';
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(let i = 0; i < length; i++) {
    unique_string += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  //TODO: if signed === true, sign the string with our private key
  return unique_string;
}

/*
* Validate that the state sent with an OIDC launch matches the state that was sent in the OIDC response
* @param req - HTTP OIDC request to launch Tool.
* @returns - boolean on whether it is valid or not
*/
function is_valid_oidc_launch(req) {
  //TODO: when state is signed before being sent, need to decode before validation
  if (req.body.state !== req.session.login_response.state) {
    return false;
  }
  return true;
}

module.exports = { create_oidc_response, is_valid_oidc_launch };
