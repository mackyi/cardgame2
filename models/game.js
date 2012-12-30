module.exports = function(mongoose) {
  var collection = 'games';
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var schema = new Schema({
    game_id: ObjectId,
    game_type: String,
    name: String,
    users: [ObjectId],
    usernames: [String]
  });
  
  this.model = mongoose.model(collection, schema);

  return this;
};