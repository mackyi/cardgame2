var express = require('express');
var app = express();
app.use(express.static('public'));

server = require('http').createServer(app)

var port = process.env.PORT || 8080;
server.listen(port, function() {
	console.log('Listening on port ' + port);
})

app.mongoose = require('mongoose');

app.mongoose.connect('mongodb://localhost/test2');

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

var models = {};
models.users = require('./models/user')(app.mongoose).model;
models.games = require('./models/games')(app.mongoose).model;


// CHAT socket.io

var io = require('socket.io').listen(server);

/**
 * Global variables
 */
// usernames which are currently connected to the chat
var usernames = {};
// latest 100 messages
var history = [ ];

// rooms which are currently available in chat
var games = ['game1','game2','game3'];
var rooms = ['room1','room2','room3'];

/**
 * Helper function for escaping input strings
 */

// Array with some colors
var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
// ... in random order
colors.sort(function(a,b) { return Math.random() > 0.5; } );


function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
io.sockets.on('connection', function (socket) {
	var username = false;
    var userColor = false;
    console.log((new Date()) + ' Connection accepted.');
    if (history.length > 0) {
        socket.emit('history',history);
    }
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', function(name){
		console.log('hi1');
		// store the username in the socket session for this client
		if(usernames[name]){
			console.log('already exists')
			k=1;
			socket.username=name+k
			while(usernames[username]){
				socket.username=name + ++k;
			}
			socket.emit('changename', socket.username)
		}
		else{
			socket.username = name;
		}
		// get random color and send it back to the user
        socket.userColor = colors.shift();
        socket.emit('color', socket.userColor)
		// store the room name in the socket session for this client
		socket.room = 'game1';
		// add the client's username to the global list
		usernames[socket.username] = socket.username;
		console.log(usernames);
		console.log((new Date()) + ' User is known as: ' + socket.username
                            + ' with ' + socket.userColor + ' color.');
		// send client to room 1
		socket.join(socket.room);
		// echo to client they've connected
		socket.emit('updatechat', {time: (new Date()).getTime(), 
			text:'You have connected to ' + socket.room, author: 'Server', color: 'black'});
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to(socket.room).emit('updatechat', {time: (new Date()).getTime(), 
			text: socket.username + ' has connected to this room', author: 'Server', color: 'black'});
		socket.emit('updaterooms', rooms, 'room1');
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we want to keep history of all sent messages
                var obj = {
                    time: (new Date()).getTime(),
                    text: htmlEntities(data),
                    author: socket.username,
                    color: socket.userColor
                };
                history.push(obj);
                history = history.slice(-100);

		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', obj);
	});

	socket.on('switchRoom', function(newroom){
		// leave the current room (stored in session)
		socket.leave(socket.room);
		// join new room, received as function parameter
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});

	socket.on('startGame', function(deck){
		console.log('game started')
		socket.broadcast.to(socket.room).emit('updateDeck', deck)
		console.log(io.sockets.clients(socket.room))
	})
	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
		colors.push(userColor);
	});
});