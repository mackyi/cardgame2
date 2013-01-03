
var db = require('../accessDB');
User = require('../models/user');
module.exports = {
	// app.get('/')
	home: function(req, res) {
		res.render('home.jade');
	},

	//app.get('/register'...)
	getRegister: function(req, res) {
		res.render('register.jade');
	},

	//app.post('/register'...)
	postRegister: function(req, res) {
		console.log(req.body)
		db.saveUser({
			password: req.param('password'),
			username: req.param('username')}
			, function(err,docs) {
			 	res.redirect('/');
			}
		)
		console.log('success')
	},

	//app.get('/about', ...)
	about: function(req, res) {
		res.render('about.jade');
	},

	//app.get('/login', ...)
	login: function(req, res) {
		res.render('login.jade')
	},

	// app.get('/account', ensureAuthenticated, ...
	getAccount: function(req, res) {
	    db.getMyEvent(function(err, myEvent) {
	      res.render('account.jade', { locals:
	        { title: 'CrowdNotes' 
	        , currentUser: req.user
	        , myEvent: myEvent }
	      });
	    });
	},
	// app.get('/game')
	game: function(req, res) {
		res.render('game.jade')
	},

    // app.get('/logout'...)
    logout: function(req, res){
     	req.logout();
     	res.redirect('/');
  }
};