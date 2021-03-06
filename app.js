
/**
 * Module dependencies.
 */

var express = require('express')
	, routes = require('./routes')
	, routes_api = require('./routes/api')
	, http = require('http');

var app = express();

app.configure(function(){
	app.set('host', process.env.HOST || '0.0.0.0');
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
//	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/api/audio.search', routes_api.audioSearch);
app.get('/api/audio.get', routes_api.audioGet);
app.get('/api/ping', routes_api.ping);

http.createServer(app).listen(app.get('port'), function()
{
	console.log("Express server listening on port " + app.get('port'));
});
