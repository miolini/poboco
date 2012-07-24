var http = require('http');
var https = require('https');
var crypto = require('crypto');
var fs = require('fs');
var util = require('util');
var url = require('url');
var vkclient = require('../core/vkclient');
var core_utils = require('../core/utils');
var config = require('../core/config');

var KEY = 'asdfasdfwer12371';
var vkClient = new vkclient.VkontakteClient(config.vk_token);

var clean = function(str)
{
    str = str.replace(/[^a-z^A-Z^0-9\(\)\s\,\.\:\-\'']/g,' ');
	str = str.replace(/\s{2,}/, ' ');
	str = str.replace(/^\s+/,'');
	str = str.replace(/\s+$/,'');
    return str;
}
exports.audioSearch = function(req, res) {
	var query = req.param('q');
	if (query == undefined || query.trim() == '') 
	{
		res.end('need q param');
		return;
	}
	console.log('search audio for query: '+query);
	res.setHeader('Content-Type', 'text/javascript');
	vkClient.audioSearch(query, function (result) {
		if (result.error) {
			res.end('error');
			return;
		}
		var items = [];
		var cache = {};
		for(i in result)
		{
			var item = result[i];
			if (item.title == undefined) continue;
			var id = JSON.stringify({'url': item.url});
			id = core_utils.crypto_encode(KEY, id);
			if (item.title != undefined)
			{
				if (item.title.length > 50) continue;
				item.title = clean(item.title);
			} 
			if (item.artist != undefined)
			{
				if (item.artist.length > 50) continue;
				item.artist = clean(item.artist);
			} 
			var key = item.artist+item.title;
			key = key.toLowerCase();
			if (cache[key]) continue;
			items.push({'title': item.title, 'artist': item.artist, 'duration': item.duration, 'id': id});
			cache[key] = true;
		}
		res.end(JSON.stringify({query:query, items:items}));
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
			
			clientRes.pipe(res);
			//var fileStream = fs.createWriteStream(fileName);
			//clientRes.pipe(fileStream);
		});
	});
	stream.on('open', function()
	{
	    res.setHeader('Content-Type','audio/mpeg');
	});
	stream.pipe(res);
};

exports.ping = function(req, res)
{
	res.end(JSON.stringify({response:'pong',data: req.param('data')}));
}