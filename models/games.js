module.exports = function(mongoose) {
  var collection = 'games';
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var schema = new Schema({
    game_id: ObjectId,
    users: [ObjectId],
  });
  
  this.model = mongoose.model(collection, schema);

  return this;
};