var User = require('./models/user');

var passport = require('passport');



function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}



module.exports = function(app, io){
	var start = require('./routes/index')(io);

	app.get('/login', start.login);

	app.get('/game', start.game);

	app.get('/play', start.play);

	app.get('/', start.home);

	app.get('/register', start.getRegister);

	app.post('/login', 
			passport.authenticate('local', {successRedirect: '/',
                                  			failureRedirect: '/login',
                                  			failureFlash: true}));
	app.post('/register', start.postRegister);
};

