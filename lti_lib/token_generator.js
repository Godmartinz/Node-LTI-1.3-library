require("dotenv").config();
const axios=require("axios");
const jwt = require('jsonwebtoken');


/* The Token Maker creates a JSON web token in accordance with the LTI 1.3 standard and in conjunction with Oauth 2.0 validation. 
 the tokenMaker() should be called in route block that handles the Oauth token validiation. */

function tokenMaker(errors, res) {
  
  if (errors.length === 0) {
    // no errors
    res.setHeader("Content-Type", "application/json;charset=UTF-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Pragma", "no-cache");
    const payload = {
      sub: process.env.CLIENT_ID,
      expires_in: 3600, // 1 hour per IMS spec
      token_type: "bearer",
      scope: ""
    };
    const jwt_payload = jwt.sign(payload, process.env.CLIENT_SECRET, {
      algorithm: "RS256"
    });
    return res.status(200).send({ jwt: jwt_payload });
  } else {
    if (errors.findIndex(e => e.includes("grant type invalid")) >= 0) {
      return res.status(400).send({
        error: "unsupported_grant_type",
        errors: errors
      });
    } else if (errors.findIndex(e => e.includes("invalid")) >= 0) {
      return res.status(401).send({
        error: "invalid_client",
        errors: errors
      });
    } else {
      return res.status(400).send({
        error: "invalid_requestx",
        errors: errors
      });
    }
  }
}

function tokenRequest(req) {
  const payload = {
    iss: req.session.platform_DBinfo.consumerToolClientID,
    sub: req.session.platform_DBinfo.consumerToolClientID,
    aud: req.session.platform_DBinfo.consumerUrl,
    exp: Date.now() + 3600,
    iat: Date.now(),
    jti: 'lkasjdf;loiuadsfjk' //create_unique_string(25, false),
  };
  const jwt_payload = jwt.sign(
    JSON.stringify(payload),
    {
      key: req.session.platform_DBinfo.kid[0].privateKey,
      passphrase: req.session.platform_DBinfo.kid[0].keyID
    },
    {
      algorithm: "RS256"
    }
  );
    console.log("----------KeyID--------" + req.session.platform_DBinfo.kid[0].keyID + '-------------------cryid-----------');
    console.log(jwt_payload);
  // const message = {
  //   grant_type: 'client_credentials',
  //   scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score'
  // }
  axios.post(req.session.platform_DBinfo.consumerAccessTokenURL, {
    body: { 
      grant_type: 'client_credentials',
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: jwt_payload,
      scope: 'https://purl.imsglobal.org/spec/lti-ags/scope/score'
    }
  },
  { 
    headers: {
      // host: 'https://demo.moodle.net',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  .then(result => console.log("JWT Request:" +result))
  .catch(err => console.log(err));
  return jwt_payload;
}

module.exports = { tokenMaker, tokenRequest };
