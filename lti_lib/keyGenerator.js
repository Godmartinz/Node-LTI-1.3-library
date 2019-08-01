const { generateKeyPairSync } = require("crypto");
const crypto = require("crypto");

/*
The Key Generator creates a pair of rsa keys to validate a session between the LMS and the Platform.
*/

function passPhrase() {
  var phrase = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 255; i++) {
    phrase += characters.charAt(Math.random() * characters.length);
  }
  
  return phrase.toString();
}
//The signature and the verification needs to be updated with a proper consumerID or some other unique identifer
function keyGenerator() {
  var kid= passPhrase();
  var keys = {};

  const { publicKey, privateKey } = generateKeyPairSync(
    "rsa",
    {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "spki",
        format: "pem"
      },
      privateKeyEncoding: {
        type: "pkcs8",
        format: "pem",
        cipher: "aes-256-cbc",
        passphrase: kid
      }
    },
    (err, publicKey, privateKey) => {
      var sign = crypto.createSign("RSA-SHA256");
      sign.update("ConsumerToolClientID");
      const signature = sign.sign(privateKey, "base64");
      console.info("signature: %s", signature);

      const verify = crypto.createVerify("RSA-SHA256");
      verify.update("ConsumerToolClientID");
      const verified = verify.verify(publicKey, "base64");
      console.info("is signature ok? %s", verified);
    }
  );


  keys={ 'publicKey': publicKey , 'privateKey': privateKey, keyID: kid };

  return keys;
}

module.exports = { keyGenerator };
