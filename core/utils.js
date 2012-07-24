var crypto = require('crypto');

var crypto_alg = 'aes-128-cbc';
//var crypto_alg = 'des-ede3-cbc';

var crypto_encode = function(pass, text)
{
	var iv = new Buffer(md5(text+'ASDFASDF@!#%@#T!GVB$#$!#'),'base64');
	var cipher = crypto.createCipheriv(crypto_alg, pass, iv);
	var crypted = cipher.update(text,'utf8','base64');
	crypted += cipher.final('base64');
	return iv.toString('base64')+'_'+crypted;
}

var crypto_decode = function(pass, text)
{
	var iv = new Buffer(text.substring(0,24),'base64');
	var cipher = crypto.createDecipheriv(crypto_alg, pass, iv);
	text = text.substring(24);
	var crypted = cipher.update(text,'base64','utf8');
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
