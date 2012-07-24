var Client = function(url)
{
	var self = {};
	self.url = url;
	self.request = function(method, params, callback)
	{
		$.get(self.url+method, params, function (response) 
		{
			if (callback == undefined) return;
			try
			{
				var result = JSON.parse(response);
			} catch (e) 
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
				if (url != self.url) self.audio.setAttribute('src', url);
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

var client = new Client('/api/');
var lastQuery = false;
var player = new Player();

var search = function(query)
{
	//$('#search_box').val(query);
	query = query.replace(/[\s]+/, ' ');
	if (query == lastQuery) return;
	lastQuery = query;
	console.log('searching: '+query);
	$('#search_results').text('Loading...');
	client.request('audio.search', {q: query}, function(result)
	{
		$('#search_results').html('');
		if (result == undefined) return;
		if (result.error)
		{
			console.log('error: '+result.error);
			return;
		}
		if (result.length == 0)
		{
			$('#search_results').text('Nothing found.');
			return;
		}
		for(i in result)
		{
			var item = result[i];
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
	//search('sting');
	$('#search_box').keyup(function(e)
	{
		var query = $(this).val();
		search(query);
	});
});
