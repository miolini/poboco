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
				var result = eval(response);
				callback(result);
			} 
			catch (e) 
			{
				console.log('error: '+e);
			}
		});
	}
	return self;
}

var Player = function() {
	var self = {};
	self.playlist = [];
	self.audio = new Audio();
	
	self.finish = function(e)
	{
		var url = 0;
	    
		var callback = function(e)
		{
			if (e.stage == 'play')
				$('#bt_'+e.data.id).attr('class', 'pause');
			else 
				$('#bt_'+e.data.id).attr('class', 'play');
		}
	    
		for(i in self.playlist)
		{
			var item = self.playlist[i];
			if (item.url == self.url && self.playlist.length > i + 1)
			{
				item = self.playlist[parseInt(i)+1];
				self.play(item.url, callback, {id:item.id});
				return;
			}
		}
	    
		if (self.playlist.length > 0)
		{
			var item = self.playlist[0];
			self.play(item.url, callback, {id:item.id});
		}
	}
	
	self.audio.addEventListener('ended', self.finish);
	self.audio.preload = true;
	
	self.clearPlaylist = function() 
	{
	    self.playlist = [];
	}
	
	self.getPlaylist = function()
	{
	    return self.playlist;
	}
	
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
	$('#search_results').text('');
	if (query == '')
	{
		if (lastQuery) $('#search_box').removeClass('loading');
		return;
	}
	if (query == lastQuery) return;
	lastQuery = query;
	$('#search_box').addClass('loading');
	$('#search_results').hide();
	client.request('audio.search', {'q':query}, function(result)
	{
		if (result == undefined) return;
		if (result.error)
		{
			console.log('error: '+result.error);
			return;
		}
		if (query != lastQuery) return;
		if (result.items.length == 0)
		{
			$('#search_results').text('Nothing found.');
			return;
		}
		$('#search_box').removeClass('loading');
		$('#search_results').show();
		player.clearPlaylist();
		for(i in result.items)
		{
			var item = result.items[i];
			if (item.title == undefined) continue;
			var mins = Math.floor(item.duration/60);
			var secs = item.duration - mins*60;
			if (secs < 10) secs = '0' + secs;
			var duration = mins+':'+secs;
			item.url = '/api/audio.get?id='+item.id;
			player.getPlaylist().push(item);
			$('#search_results').append('<span class="item nonselect"><span class="play" id="bt_'
				+item.id+'" aid="'+item.id+'"/>'+item.artist+' - '+item.title+
				'<span class="duration">'+duration+'</span></span>');
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
	//$('#search_box').focus();
	$('#search_box').keyup(function(e)
	{
		if (e.keyCode == 91) return;
		var query = $(this).val();
		search(query);
	});
});
