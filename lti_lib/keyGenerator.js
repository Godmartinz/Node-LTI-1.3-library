const {generateKeyPair}= require('crypto');

/*

*/
function keyGenerator(){
generateKeyPair('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc-hmac-sha1',
        passphrase: "hello moodle"
    }
}, (err, publicKey, privateKey) => {
    if((publicKey==null) || (privateKey ==null)){
        console.log(err);
    }
    return publicKey+privateKey;
});
}

module.exports= {keyGenerator};