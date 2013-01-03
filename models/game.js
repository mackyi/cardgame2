var collection = 'game';

mongoose = require('mongoose')
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var schema = new Schema({
  game_id: ObjectId,
  game_type: String,
  name: String,
  users: [ObjectId],
  usernames: [String]
});
  
module.exports= mongoose.model(collection, schema);
