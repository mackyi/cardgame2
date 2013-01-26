Game = require('./models/game');

var games;

Game.find({}, function(err, dbGames){
		games = dbGames;
})
