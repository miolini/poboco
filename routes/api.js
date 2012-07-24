var http = require('http');
var https = require('https');
var crypto = require('crypto');
var fs = require('fs');
var util = require('util');
var url = require('url');
var vkclient = require('../core/vkclient');
var core_utils = require('../core/utils');
var config = require('../core/config');

var KEY = 'asdfasdfwer123719823!@#!@';
var vkClient = new vkclient.VkontakteClient(config.vk_token);

var clean = function(str)
{
    return str;
    str = str.replace(/[^a-z^A-Z^0-9]/,'');
    return str;
}

exports.audioSearch = function(req, res) {
	var query = req.param('q');
	if (query == undefined || query.trim() == '') 
	{
		res.end('need q param');
		return;
	}
	res.setHeader('Content-Type', 'text/javascript');
	console.log('search audio for query: '+query);
	vkClient.audioSearch(query, function (result) {
		if (result.error) {
			res.end('error');
			return;
		}
		var result2 = [];
		for(i in result)
		{
			var item = result[i];
			if (item.title == undefined) continue;
			var id = JSON.stringify({'url': item.url});
			id = core_utils.crypto_encode(KEY, id);
			if (item.title != undefined)
			{
				if (item.title.length > 30) continue;
				item.title = clean(item.title);
			} 
			else if (item.artist != undefined)
			{
				if (item.artist.length > 30) continue;
				item.artist = clean(item.artist);
			} 
			result2.push({'title': item.title, 'artist': item.artist, 'duration': item.duration, 'id': id, parent: JSON.stringify(item)});
		}
		res.end(JSON.stringify(result2));
	});
};


exports.audioGet = function(req, res)
{
	var id = req.param('id');
	console.log('play audio: '+id);
	var hash = core_utils.md5(id);
	var fileName = 'storage/'+hash+'.mp3';
	res.setHeader('Content-Type','audio/mpeg');
	var stream = fs.createReadStream(fileName);
	stream.on('error', function(e)
	{
		var item = core_utils.crypto_decode(KEY, id);
		var item = JSON.parse(item);
		var itemUrl = url.parse(item.url);
		console.log(item.url);
		var opts = {'port': 80, 'host': itemUrl.host, 'path': itemUrl.path};
		var client = http.get(opts, function(clientRes)
		{
			res.setHeader('Content-Type','audio/mpeg');
			console.log('connected');
			var fileStream = fs.createWriteStream(fileName);
			clientRes.pipe(res);
			clientRes.pipe(fileStream);
		});
	});
	stream.on('open', function()
	{
	    res.setHeader('Content-Type','audio/mpeg');
	});
	stream.pipe(res);
};