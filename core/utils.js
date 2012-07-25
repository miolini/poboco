var crypto = require('crypto');

var crypto_alg = 'aes-128-cbc';
//var crypto_alg = 'des-ede3-cbc';

var crypto_encode = function(pass, text)
{
	//var iv = new Buffer(md5(text+'ASDFASDF@!#%@#T!GVB$#$!#'),'hex');
	var cipher = crypto.createCipher(crypto_alg, pass);
	var crypted = cipher.update(text,'utf8','hex');
	crypted += cipher.final('hex');
	//return iv.toString('hex')+'_'+crypted;
	return crypted;
}

var crypto_decode = function(pass, text)
{
	//var iv = new Buffer(text.substring(0,32),'hex');
	var cipher = crypto.createDecipher(crypto_alg, pass);
	//text = text.substring(32);
	var crypted = cipher.update(text,'hex','utf8');
	crypted += cipher.final('utf8');
	return crypted;
}

var md5 = function(data)
{
	return crypto.createHash('md5').update(data).digest("base64");
}

exports.crypto_encode = crypto_encode;
exports.crypto_decode = crypto_decode;
exports.md5 = md5;
