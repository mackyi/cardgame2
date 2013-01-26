var User = require('./models/user');

var passport = require('passport');



function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

function LocalUser(req, res, next){
	res.locals.user = req.user;
  	next();
}

function LocalGame_Id(req, res, next){
	console.log(req.params.game_id);
	res.locals.game_id = req.params.game_id;
	next();
}

module.exports = function(app, io, games){
	var start = require('./routes/index')(io, games);

	app.get('/login', start.login);

	app.get('/game/:game_id', ensureAuthenticated, LocalUser, LocalGame_Id, start.game);

	app.get('/play', ensureAuthenticated, start.play);

	app.get('/', LocalUser, start.home);

	app.get('/register', start.getRegister);

	app.post('/login', 
			passport.authenticate('local', {successRedirect: '/',
                                  			failureRedirect: '/login',
                                  			failureFlash: true}));
	app.post('/register', start.postRegister);
};

