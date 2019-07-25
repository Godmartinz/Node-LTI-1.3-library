require('dotenv').config();

function oidc_response(req) {
  const response = {
    scope: 'openid',
    response_type: 'id_token',
    client_id: process.env.CLIENT_ID,           // need to get this from DB?
    redirect_uri: process.env.REDIRECT_URI,     // need to get this from DB for req.body.iss
    login_hint: req.body.login_hint,
    state: create_nonce(30),
    response_mode: 'form_post',
    nonce: create_nonce(25),
    prompt: 'none'
  }
  return response;
}

function create_nonce(length) {
  let nonce = '';
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(let i = 0; i < length; i++) {
    nonce += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return nonce;
}

function valid_oidc(req) {
  let valid = true;
  if (decoded.state !== req.session.login_response.state) {
    return false;
  // } else {
  //   jwt.verify(
  //     req.body.id_token,
  //     process.env.CLIENT_PUBLIC,
  //     { algorithm: ["RS256"] },
  //     (err, decoded) => {
  //       console.log('after decoding, first decoded, then err');
  //       console.log(decoded);
  //       console.log(err);
  //       if (err) {
  //         return false;
  //       } 
  //     })
  }
  return valid;
}

module.exports = { oidc_response, valid_oidc };
