module.exports = function(mongoose) {
  var collection = 'User';

  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;

  var passport = require('passport');
  var bcrypt = require('bcrypt');


  var ObjectId = Schema.ObjectId;

  var schema = new Schema({
    name:{
      first: {type: String, required: false},
      last: {type: String, required: false}
    },
    username: { type: String, unique: true},
    email: { type: String, unique: true},
    salt: { type: String, required: true},
    hash: { type: String, required: true}
  });

  schema
  .virtual('password')
  .get(function (){
    return this._password;
  })
  .set(function (password) {
    this._password = password;
    var salt = this.salt = bcrypt.genSaltSync(10);
    this.hash = bcrypt.hashSync(password, salt);
  });

  schema.method('verifyPassword', function(password, callback) {
    bcrypt.compare(password, this.hash, callback);
  });

  schema.static('authenticate', function(email, password, callback){
    this.findOne({email:email}, function(err, user){
      if(err){ return callback(err); }
      if(!user){ return callback(null, false); }
      user.verifyPassword(password, function(err, passwordCorrect){
        if(err){return callback(err); }
        if(!passwordCorrect){return callback(null, false); }
        return callback(null,user);
      })
    })
  })
  this.model = mongoose.model(collection, schema);

  return this;
};