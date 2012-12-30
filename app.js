
//base dependencies for app
var express = require('express'),
	passport = require('passport'),
	mongoose = require('mongoose'),
	mongoStore = require('connect-mongodb'),
	backbone=require('backbone'),
	flash=require('connect-flash'),
	PlayingCards=require('./public/javascript/playingcards-server')(backbone)

app = express(),
server = require('http').createServer(app)

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
  	store: mongoStore(conn),
  	secret: 'signalandnoise'},
  	function() {
  		app.use(app.router);
  	}));
  app.use(passport.initialize());
  app.use(passport.session());
});

db = new DB.startup(conn);

app.configure('development', function(){
	app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

require('./socket')(server, PlayingCards)

require('./routes')(app);

var port = process.env.PORT || 8080;
server.listen(port, function() {
	console.log('Listening on port ' + port);
})