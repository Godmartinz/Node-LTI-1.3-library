require('dotenv').config();
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;
// const { platformSchema } = require('./registerPlatform');

/*
* Validates OIDC login request.  Checkes required parameters are present and looks up Issuer in database to ensure they
* are registered with the Tool.
* @param req - OIDC login request sent from LMS to Tool
* @returns array of errors, if empty then request is valid
*/
function is_valid_oidc_login(req) {
  let errors = [];
  if (req.body.hasOwnProperty('iss')) {
    // let platform = await Database.Get('platforms', platformSchema, { consumerUrl: req.body.iss });
    if (!true) {                                 // TODO:  need to look up issuer in DB (platform.consumerURL) and make sure they are registered
      errors.push('Issuer not registered with Tool');
    }
  } else {
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
* Validate OIDC login and construct response for valid logins.
* @param req - req sent from OIDC to Tool's OIDC login endpoint
* @returns if valid request, returns properly formated response object
* @return if invalid request, returns array of errors with the request
*/
function create_oidc_response(req) {
  const errors = is_valid_oidc_login(req);
  // let platform = await Database.Get('platforms', platformSchema, { consumerUrl: req.body.iss });
  if (errors.length === 0) {
    let response = {
      scope: 'openid',
      response_type: 'id_token',
      client_id: process.env.CLIENT_ID,           // TODO: need to get this from DB (platform.consumerClientID) as it is received from LMS on registration
      redirect_uri: process.env.REDIRECT_URI,     // TODO: should this be stored in DB per Issuer (Consumer)?
      login_hint: req.body.login_hint,
      state: create_unique_string(30, true),
      response_mode: 'form_post',
      nonce: create_unique_string(25, false),
      prompt: 'none'
    }
    if (req.body.hasOwnProperty('lti_message_hint')) {
      response = {
        ...response,
        lti_message_hint: req.body.lti_message_hint,
      };
    }
    return response;
  } else {
    return errors;
  }
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
