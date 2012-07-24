var https = require('https');

var Client = function(authToken) 
{
	var self = {};
	self.authToken = authToken;

	self.request = function(method, params, callback)
	{
		var query = '?';
		if (params != undefined && params.length != undefined) params = {};
		params['access_token'] = self.authToken;
		for(i in params)
		{
			query += i + '=' + encodeURIComponent(params[i])+'&';
		}
		var path = '/method/'+method+query;
		https.get({'host': 'api.vk.com', 'path': path}, function(res) {
			var body = '';
			res.on('data', function(bytes) 
			{
				body += bytes; 
			});
			res.on('end', function()
			{
				var result = JSON.parse(body);
				if (result.error == undefined)
						result = result.response;
				if (callback != undefined) callback(result);
			});
		});
	};

	self.audioSearch = function(query, callback)
	{
		self.request('audio.search', {'q': query, 'sort': 2, 'auto_complete': 0, 'count': 50}, callback);
	};

	self.audioGet = function(id, url)
	{
		
	};
	return self;
};

exports.VkontakteClient = Client;