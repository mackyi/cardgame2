var collection = 'game';

mongoose = require('mongoose')
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var schema = new Schema({
  game_id: ObjectId,
  gameType: String,
  name: String,
  users: [ObjectId],
  usernames: [String],
  active: {type: Boolean, default: true},
  chat: {
  	history: [String],
  	userColors: [String]
  }
})
  
module.exports= mongoose.model(collection, schema);
