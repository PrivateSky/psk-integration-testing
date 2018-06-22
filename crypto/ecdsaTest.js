const ecdsa = require("../../../modules/pskcrypto/ecdsa/lib/ECDSA").createECDSA('secp256k1');

var assert = require("../../../modules/double-check").assert;

var dataToSign = "some data to sign";

var keyPair = ecdsa.generateKeyPair();

var signature = ecdsa.sign(keyPair.private,dataToSign);

assert.notEqual(signature,null,"Signature is null.");

assert.true(ecdsa.verify(keyPair.public,signature,dataToSign),"Fail at verifying the signature");