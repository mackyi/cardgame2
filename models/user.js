module.exports = function(mongoose) {
  var collection = 'users';
  var Schema = mongoose.Schema;
  var ObjectId = Schema.ObjectId;

  var schema = new Schema({
    user_id: ObjectId,
    username: String,
    email: String,
    password: String,
  });

  schema.method('validPassword', function(password) {
    return this.password === password;
  });

  this.model = mongoose.model(collection, schema);

  return this;
};