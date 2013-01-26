// Models
var mongoose = require('mongoose'),
	User = require('./models/user'),
	Game = require('./models/game'),
	PlayingCards=require('./public/javascript/playingcards-server');

module.exports = function(io, games){
	// Array with some colors in random order
	var colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];
	colors.sort(function(a,b) { return Math.random() > 0.5; } );


	//testing room
	Game.find({active: true}, function(err, dbGames){
			games = dbGames;
			var history = [];
			games[0].chat = {history: history, userColors: colors};
	})

	// var test = new Game({name: 'test', gameType: 'mWar'});
	// games.push(test);
	// test.save();
	

	/**
	 * Helper function for escaping input strings
	 */
	function htmlEntities(str) {
	    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
	                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	}

	io.sockets.on('connection', function(socket){
		//doesn't work ?
		if(typeof socket.handshake.sessionID === 'undefined' || typeof socket.handshake.session === 'undefined'){
			socket.disconnect();
		}

		//initialize some stuff
		var userColor = false;

		// get user from session
		try{
			console.log('A socket with sessionID ' + socket.handshake.sessionID + ' connected!');
			// allows for socket to do io.sockets.in(req.sessionID).emit();
			socket.join(socket.handshake.sessionID);
			User.findById(socket.handshake.session.passport.user, function(err, user){
				if(err){
					console.log('No user found. what the hell, ' + err);
				}
				console.log(user.username); //works
				socket.user = user;
				try{
			 		socket.room = games[0];
					socket.join(socket.room.name);
					// update game users
				 	try{
				 		socket.room.users.push(socket.user);
				 		socket.room.usernames.push(socket.user.username);
						io.sockets.in(socket.room.name).emit('updateUsers', socket.room.usernames);
				 	}
			 		catch(err){
			 			console.log('Failed to update users because ' + err);
			 		}

			 	}
			 	catch(err){
			 		console.log('Failed to join game because ' + err);
			 	}
			});
		}
		catch(err){
			console.log('No session, ' +err);
		}
		

	    // if (history.length > 0) {
	    //     socket.emit('history',history);
	    // }	 	


		socket.on('newgame', function(options){
			console.log('starting new game');
			games[games.length]= new Game(options);
		})

		socket.on('joinGame', function(){
			console.log('in game');
			socket.userColor = colors.shift();
	        socket.emit('color', socket.userColor)
			socket.emit('gameInfo', socket.user.username);
			io.sockets.in(socket.room.name).emit('updatechat', {time: (new Date()).getTime(), 
				text:'You have connected to ' + socket.room.name, author: 'Server', color: 'black'});
		})
		// when the client emits 'adduser', this listens and executes
		
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
	                    author: socket.user.username,
	                    color: socket.userColor
	                };
	                socket.room.chat.history.push(obj);
	                socket.room.chat.history = socket.room.chat.history.slice(-100);

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
			
			// echo globally that this client has left
			socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username + ' has disconnected');
			socket.room.users.splice(socket.room.users.indexOf(socket.user),1);
			socket.room.usernames.splice(socket.room.usernames.indexOf(socket.username),1);
			// update list of users in chat, client-side
			io.sockets.emit('updateusers', socket.room.usernames);
			socket.broadcast.to(socket.room.name).emit('updateUsers', socket.room.usernames);
			socket.leave(socket.room.name);
			colors.push(userColor);
		});
	});
}