var User = require('./models/user');

var passport = require('passport');



function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}



module.exports = function(app, io, games){
	var start = require('./routes/index')(io, games);

	app.get('/login', start.login);

	app.get('/game', ensureAuthenticated, start.game);

	app.get('/play', ensureAuthenticated, start.play);

	app.get('/', start.home);

	app.get('/register', start.getRegister);

	app.post('/login', 
			passport.authenticate('local', {successRedirect: '/',
                                  			failureRedirect: '/login',
                                  			failureFlash: true}));
	app.post('/register', start.postRegister);
};

