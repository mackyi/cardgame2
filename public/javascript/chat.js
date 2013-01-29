$(function () {
	var socket = io.connect('http://localhost:8080');

	var content = $('#content');
    var input = $('#input');
    var status = $('#status');

    var players = [];
    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName;
	// on connection to server, ask for user's name with an anonymous callback

    var pathname  = window.location.pathname;
    game_id = pathname.substring(pathname.indexOf("/", 1)+1);
    console.log(game_id);
	socket.on('connect', function () {
		console.log('hi')
        // first we want users to enter their names
        socket.emit('joinGame', game_id);
    });
    socket.on('gameInfo', function(username){
        myName = username;
        input.removeAttr('disabled');
        status.text(myName);
    })
    socket.on('history', function(history){
    	for (var i=0; i < history.length; i++) {
                addMessage(history[i].author, history[i].text,
                           history[i].color, new Date(history[i].time));
            }
    })

	socket.on('color', function(color){
		console.log(color)
		myColor = color;
        status.text(myName + ': ').css('color', myColor);
        input.removeAttr('disabled').focus();
        // from now user can start sending messages
	})

    socket.on('updateUsers', function(users){
        $('#players').empty();
        console.log('updating users');
        for(_i=0; _i<users.length; _i++)
        {
            $('#players').append('<li>'+users[_i]+'</li>');
            console.log('in for loop');
            players.push(users[_i]);
        }
    })
    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = input.val();
            if (!msg) {
                return;
            }
            // send the message as an ordinary text
            if (myName === false) {
            	socket.emit('adduser', msg);
                myName = msg;
            }
            else{
            	socket.emit('sendchat', msg)
            }
            input.val('');
            // disable the input field to make the user wait until server
            // sends back response
            input.attr('disabled', 'disabled');
            // we know that the first message sent from a user their name
            
        }
    });

	// listener, whenever the server emits 'updatechat', this updates the chat body
	socket.on('updatechat', function (data) {
		console.log('updatechat');
		input.removeAttr('disabled'); // let the user write another message
        addMessage(data.author, data.text,
                   data.color, new Date(data.time));
	});

	socket.onerror = function (error) {
        console.log(error)
        // just in there were some problems with conenction...
        content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
                                    + 'connection or the server is down.</p>' } ));
    };

    socket.on('changename', function(name){
    	myName = name;
    })
	// listener, whenever the server emits 'updaterooms', this updates the room the client is in
	socket.on('updaterooms', function(rooms, current_room) {
		$('#rooms').empty();
		$.each(rooms, function(key, value) {
			if(value == current_room){
				$('#rooms').append('<div>' + value + '</div>');
			}
			else {
				$('#rooms').append('<div><a href="#" onclick="switchRoom(\''+value+'\')">' + value + '</a></div>');
			}
		});
	});

	function switchRoom(room){
		socket.emit('switchRoom', room);
	}

	/**
     * Add message to the chat window
     */
    function addMessage(author, message, color, dt) {
        content.append('<p style="-webkit-margin-before: 0em; -webkit-margin-after:0em"><span style=" color:' + color + '">' + author + '</span> [' +
             + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
             + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
             + ']: ' + message + '</p>');
        $(content.prop({scrollTop: content.prop("scrollHeight") }));

    }


    // GAME

    var deckModel;

    $('#startButton').on('click', function(){
        if(players.length>1){
            $('#startButton').attr('disabled', 'disabled');
            startMWar();
        }
        else{
            alert('Not enough players!')
        }
    })
    
    socket.on('updateDeck', function(deckM){
        deckModel=new PlayingCards.DeckModel(deckM, {});
        showDeck();
    });
    
    socket.on('startgame', function(deck1, deck2,player1,player2){
        deck1= new PlayingCards.DeckModel(deck1, {});
        deck2 = new PlayingCards.DeckModel(deck2, {});
        if (myName===player1){
            myDeck=deck1
            yourDeck=deck2
        }

        else if(myName===player2){
            myDeck=deck2
            yourDeck=deck1  
        }
        myDeck.each(function(cardModel){
                cardModel.attributes.front=true;
            })
        myView = new PlayingCards.DeckView({
            el:$('#hand'),
            model: myDeck,
            templates: new PlayingCards.Templates()
        })
        myView.setCardWidth(65);
        console.log(myView);
        myView.render();

        yourView = new PlayingCards.DeckView({
            el:$('#oppHand'),
            model: yourDeck,
            templates: new PlayingCards.Templates()
        })
        yourView.setCardWidth(65);
        yourView.render();

    })

    function showDeck(){
        deckView = new PlayingCards.DeckView({
          el: $('#cards'),
          model: deckModel,
          templates: new PlayingCards.Templates()
        });
        deckView.setCardWidth(65);

        deckView.render();
    }

    function startMWar(){
        opponent=selectOpponent();
        deckModel=new PlayingCards.DeckModel(null, {front:false});
        deckModel.shuffle();
        console.log(deckModel);
        myCards = [], yourCards= [];
        for(_i=0; _i<26;_i++){
            myCards.push(deckModel.models[_i]);
        }
        for(_i=26; _i<52;_i++){
            yourCards.push(deckModel.models[_i]);
        }
        myHandModel=new PlayingCards.DeckModel(myCards, {})
        yourHandModel = new PlayingCards.DeckModel(yourCards, {})
        console.log(yourHandModel);
        socket.emit('startGame', 'MWar', myHandModel, yourHandModel, myName, opponent);
    }

    function selectOpponent(){
        opponent=players[0];
        if(opponent === myName)
        {
            opponent=players[1];
        }
        return opponent;
    }
})