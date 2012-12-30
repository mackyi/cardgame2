
var db = require('../accessDB');

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
		db.saveUser({
			fname: req.param('name.first'),
			lname: req.param('name.last'),
			email: req.param('email'),
			password: req.param('password'),
			username: req.param('username')},
			function(err,docs) {
				res.redirect('/account');
			}
		)
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