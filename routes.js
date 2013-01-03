var passport = require('passport');

var start = require('./routes/index')

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

module.exports = function(app){

	app.get('/login', start.login);

	app.get('/game', start.game);

	app.get('/', start.home);

	app.get('/register', start.getRegister);

	app.post('/login', 
			passport.authenticate('local', {successRedirect: '/',
                                  			failureRedirect: '/login',
                                  			failureFlash: true}));
	app.post('/register', start.postRegister);
};

