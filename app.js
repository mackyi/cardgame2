
//base dependencies for app
var express = require('express'),
	passport = require('passport'),
	mongoose = require('mongoose'),
	flash=require('connect-flash'),
	PlayingCards=require('./public/javascript/playingcards-server'),
  MemoryStore = express.session.MemoryStore,
  sessionStore = new MemoryStore(),
  cookie = require('cookie'),
  connect =require('connect');

app = express(),
server = require('http').createServer(app);

var DB = require('./accessDB');

var conn= process.env.MONGOLAB_URI || 
  process.env.MONGOHQ_URL || 
  'mongodb://localhost/test'; 

var db; 

// configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.static('public'));
  app.use(express.cookieParser());
  app.use(flash());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ 
    store: sessionStore,
  	key:  'express.sid',
  	secret: 'signalandnoise'}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
});

db = new DB.startup(conn);

app.configure('development', function(){
	app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var io = require('socket.io').listen(server);
io.set('authorization', function (handshakeData, accept) {

    if (handshakeData.headers.cookie) {

        handshakeData.cookie = cookie.parse(handshakeData.headers.cookie);

        handshakeData.sessionID = connect.utils.parseSignedCookie(handshakeData.cookie['express.sid'], 'signalandnoise');

        if (handshakeData.cookie['express.sid'] == handshakeData.sessionID) {
          return accept('Cookie is invalid.', false);
        }

    } else {
        return accept('No cookie transmitted.', false);
      } 
    sessionStore.get(handshakeData.sessionID, function (err, session) {
            if (err || !session) {
                // if we cannot grab a session, turn down the connection
                return accept('Error', false);
            } else {
                // save the session data 
                handshakeData.session = session;
            }
      });
    accept(null, true);
  });

// list of current games
var games = [];

require('./socket')(io, games)

require('./routes')(app, io, games);

var port = process.env.PORT || 8080;
server.listen(port, function() {
	console.log('Listening on port ' + port);
})