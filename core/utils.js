var crypto = require('crypto');

exports.crypto_encode = function(pass, text)
{
	var cipher = crypto.createCipher('aes-128-cbc', pass);
	var crypted = cipher.update(text,'utf8','hex');
	crypted += cipher.final('hex');
	return crypted;
}

exports.crypto_decode = function(pass, text)
{
	var cipher = crypto.createDecipher('aes-128-cbc', pass);
	var crypted = cipher.update(text,'hex','utf8');
	crypted += cipher.final('utf8');
	return crypted;
}

exports.md5 = function(data)
{
	return crypto.createHash('md5').update(data).digest("hex");
}
