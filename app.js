var util = require('util'),
    twitter = require('twitter');

var 
	express = require('express')
	, app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});


var port = process.env.PORT || 5000;
server.listen(port);

var twit = new twitter({
    consumer_key: process.env.twitter_consumer_key || 'CONSUMER_KEY',
    consumer_secret: process.env.twitter_consumer_secret || 'CONSUMER_SECRET',
    access_token_key: process.env.twitter_access_token_key || 'ACCESS_TOKEN_KEY',
    access_token_secret: process.env.twitter_access_token_secret || 'ACCESS_TOKEN_SECRET'
});

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendfile('index.html');
});

io.sockets.on('connection', function (socket) 
{
  twit.search('#blagueDeOuf', function(data) 
  {
      //console.log("connect");
      //console.log(data);
      if(data.statuses){
        var numTweet = data.statuses.length;
        //console.log(numTweet);
        for (var i = numTweet-1;i>=0;i--)
        {
          if(data.statuses[i].retweeted_status==undefined){
            socket.emit('load', { id: data.statuses[i].id_str });
          }
        }
      }
  });
});

twit.stream('filter', {track:'#blagueDeOuf'}, function(stream) 
{
	//console.log("OK Twitter");
    stream.on('data', function(data) {
        //console.log(data.text);
        if(data.statuses[i].retweeted_status==undefined){
            io.sockets.emit('news', { id: data.id_str });
          }
    });
});



