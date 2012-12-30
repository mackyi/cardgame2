// Module dependencies
var mongoose = require('mongoose');
var	Schema = mongoose.Schema;



// dependencies for authentication
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var User = require('./models/user');
var Game = require('./models/game');

// Define local strategy for Passport
passport.use(new LocalStrategy(
  function(username, password, done) {
    process.nextTick(function () {
      User.findOne({ username: username }, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Incorrect username.' }); }
        user.verifyPassword(password, function(err, passwordCorrect){
          if(err){return callback(err); }
          if(!passwordCorrect){return done(null, false, { message: 'Invalid password.' }); };
          return done(null, user);
        })
      });
  })
  }
))

      
// serialize user on login
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// deserialize user on logout
passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

function findByUsername(username, fn) {
  user = models.User.findOne({ username: username});
    if(user){
      return fn(null, user);
    }
    return fn(null, null);
}

// connect to database
module.exports = {
  // initialize DB
  startup: function(dbToUse) {
    mongoose.connect(dbToUse);
    // Check connection to mongoDB
    mongoose.connection.on('open', function() {
      console.log('We have connected to mongodb');
    }); 

  },

  // save a user
  saveUser: function(userInfo, callback) {
    //console.log(userInfo['fname']);
    var newUser = new User ({
      name : { first: userInfo.fname, last: userInfo.lname }
    , email: userInfo.email
    , password: userInfo.password
    , username: userInfo.username
    });

    newUser.save(function(err) {
      if (err) {throw err;}
      //console.log('Name: ' + newUser.name + '\nEmail: ' + newUser.email);
      callback(null, userInfo);
    });
  },

  
  // disconnect from database
  closeDB: function() {
    mongoose.disconnect();
  },

  // get all the users
  getUsers: function(callback) {
    User.find({}, ['username', '_id'], function(err, users) {
      callback(null, users);
    });
  },
}