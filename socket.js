// Models
var mongoose = require('mongoose');
User = require('./models/user');
Game = require('./models/game');


module.exports = function(io, PlayingCards){
	/**
	 * Global variables
	 */
	// usernames which are currently connected to the chat
	var usernames = [];
	// latest 100 messages
	var history = [];
	// games which are available
	var games = [];

	//testing room
	test = new Game({name: 'test', gameType: 'mWar'});
	games.push(test);
	test.save();
	// Array with some colors in random order
	var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
	colors.sort(function(a,b) { return Math.random() > 0.5; } );

	/**
	 * Helper function for escaping input strings
	 */
	function htmlEntities(str) {
	    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
	                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	io.sockets.on('connection', function(socket){
		console.log('A socket with sessionID ' + socket.handshake.sessionID + ' connected!');
		// allows for socket to do io.sockets.in(req.sessionID).emit();
		socket.join(socket.handshake.sessionID);

		var username = false;
	    var userColor = false;
	    console.log((new Date()) + ' Connection accepted.');
	    if (history.length > 0) {
	        socket.emit('history',history);
	    }
	    socket.user = new User();
	    socket.user.username=setname('guest');
	    // send client to room 1
	    socket.room = test
			socket.join(socket.room.name);
		socket.room.users.push(socket.user);
		socket.room.usernames.push(socket.user.username);
		socket.emit('updateUsers', socket.room.usernames);
		socket.broadcast.to(socket.room.name).emit('updateUsers', socket.room.usernames);

		socket.on('newgame', function(options){
			console.log('starting new game');
			games[games.length]= new Game(options);


		})
		// when the client emits 'adduser', this listens and executes
		socket.on('adduser', function(name){
			console.log('hi1');
			oldname = socket.user.username;
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
			socket.user.username= socket.username;
			socket.room.usernames.splice(socket.room.usernames.indexOf(oldname), 1, socket.user.username);	
			test.save();
			socket.emit('updateUsers', socket.room.usernames);
			// get random color and send it back to the user
	        socket.userColor = colors.shift();
	        socket.emit('color', socket.userColor)
			// store the room name in the socket session for this client
			
			console.log(socket.room)
			// add the client's username to the global list
			usernames[socket.username] = socket.username;
			console.log(usernames);
			console.log((new Date()) + ' User is known as: ' + socket.username
	                            + ' with ' + socket.userColor + ' color.');
			
			// echo to client they've connected
			socket.emit('updatechat', {time: (new Date()).getTime(), 
				text:'You have connected to ' + socket.room.name, author: 'Server', color: 'black'});
			// echo to room 1 that a person has connected to their room
			socket.broadcast.to(socket.room.name).emit('updatechat', {time: (new Date()).getTime(), 
				text: socket.username + ' has connected to this room', author: 'Server', color: 'black'});
			//socket.emit('updaterooms', rooms, 'room1');

			//update userlist
			socket.emit('updateUsers', socket.room.usernames);
			socket.broadcast.to(socket.room.name).emit('updateUsers', socket.room.usernames);
		});
		
		function setname(name){
			if(usernames[name]){
				console.log('already exists')
				k=1;
				uname=name+k
				while(usernames[uname]){
					uname=name + ++k;
				}
			}
			else{
				uname = name;
			}
			return uname;
		}	

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
			io.sockets.in(socket.room.name).emit('updatechat', obj);
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

		socket.on('startGame', function(game, deck1, deck2, player1, player2){
			console.log('game started')
			if(game==='MWar')
			{
				io.sockets.in(socket.room.name).emit('startgame', deck1, deck2, player1, player2)
				console.log(io.sockets.clients(socket.room))
			}
		})
		// when the user disconnects.. perform this
		socket.on('disconnect', function(){
			// remove the username from global usernames list
			delete usernames[socket.username];
			// update list of users in chat, client-side
			io.sockets.emit('updateusers', usernames);
			// echo globally that this client has left
			socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has disconnected');
			socket.room.users.splice(socket.room.users.indexOf(socket.user),1);
			socket.room.usernames.splice(socket.room.usernames.indexOf(socket.username),1);
			socket.broadcast.to(socket.room.name).emit('updateUsers', socket.room.usernames);
			socket.leave(socket.room.name);
			colors.push(userColor);
		});
	});
}