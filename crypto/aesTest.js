var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
var password = crypto.randomBytes(32);
var iv = crypto.randomBytes(16);
//var ecdsa = require('../ecdsa/lib/ECDSA').createECDSA();



function encrypt(text){
    var cipher = crypto.createCipheriv(algorithm,password,iv)
    var crypted = cipher.update(text,'utf8','hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text){
    var decipher = crypto.createDecipheriv(algorithm,password,iv)
    var dec = decipher.update(text,'hex','utf8')
    dec += decipher.final('utf8');
    return dec;
}
console.log(iv.length)
var hw = encrypt("hello world")
console.log(hw);
// outputs hello world
console.log(decrypt(hw));