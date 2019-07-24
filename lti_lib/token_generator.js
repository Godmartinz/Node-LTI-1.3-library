require("dotenv").config();
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
      scope: "https://purl/imsglobal.org/spec/lti/v1p3/scope/grading.all"
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
        error: "invalid_request",
        errors: errors
      });
    }
  }
}

module.exports = { tokenMaker };
