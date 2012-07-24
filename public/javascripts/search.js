var Client = function()
{
	var self = {};
	self.request = function(method, params, callback)
	{
		$.get('/api/'+method, params, function (response) 
		{
			if (callback == undefined) return;
			try
			{
				var result = JSON.parse(response);
			} 
			catch (e) 
			{
				console.log(e);
			}
			callback(result);
		});
	}
	return self;
}

var Player = function() {
	var self = {};
	self.audio = new Audio();
	self.audio.preload = true;
	
	self.play = function(url, callback, data) {
		try 
		{
			if (self.callback != undefined)
			{
				self.callback({stage:self.stage=='play' ? 'pause':'play', data: self.callbackData});
			}
			if (url == self.url && self.stage == 'play')
			{
				self.audio.pause();
				self.stage = 'pause';
				self.callback = undefined;
				self.callbackData = undefined;
			}
			else
			{
				if (url != self.url) 
				{
					self.audio.src = url;
					self.audio.load();
				}
				self.url = url;
				self.stage = 'play';
				console.log('play '+url);
				
				self.audio.play();
				self.callback = callback;
				self.callbackData = data;
			}
			callback({stage:self.stage,data:data});
		} 
		catch (e) 
		{
			console.log('error'+e);
		}
	}
	
	return self;
}

var client = new Client();
var lastQuery = false;
var player = new Player();

var search = function(query)
{
	query = query.replace(/[\s]+/, ' ').trim().replace(/[^a-z^A-Z^а-я^А-Я^0-9\s]/,'');
	console.log('query: '+query);
	if (query == '')
	{
		if (lastQuery) $('#search_box').removeClass('loading');
		return;
	}
	if (query == lastQuery) return;
	lastQuery = query;
	console.log('searching: '+query);
	console.log('basta');
	$('#search_box').addClass('loading');
	client.request('audio.search', {q: query}, function(result)
	{
		console.log('basta');
		if (result == undefined) return;
		if (result.error)
		{
			console.log('error: '+result.error);
			return;
		}
		//if (result.query != lastQuery) return;
		$('#search_results').html('');
		if (result.items.length == 0)
		{
			$('#search_results').text('Nothing found.');
			return;
		}
		$('#search_box').removeClass('loading');
		for(i in result.items)
		{
			var item = result.items[i];
			if (item.title == undefined) continue;
			$('#search_results').append('<span class="item nonselect">');
			$('#search_results').append('<span class="play" id="bt_'+item.id+'" aid="'+item.id+'"/>'+item.artist+' - '+item.title+'</span>');
			$('#bt_'+item.id).click(function()
			{
				var aid = $(this).attr('aid');
				player.play('/api/audio.get?id='+aid, function(e)
				{
					if (e.stage == 'play')
						$('#bt_'+e.data.id).attr('class', 'pause');
					else 
						$('#bt_'+e.data.id).attr('class', 'play');
				}, {id:aid});
			});
		}
	});
}

$(function()
{
	setInterval(function()
	{
		$.get('/api/ping', function(response)
		{
			alert(response);
		});
	}, 2000);
	//$('#search_box').focus();
	$('#search_box').keyup(function(e)
	{
		var query = $(this).val();
		search(query);
	});
});
