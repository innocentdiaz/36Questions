const mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    required: true,
    trim: true,
    unique: true,
    type: String
  },
  password: {
    required: true,
    type: String
  }
});
var User = mongoose.model('user', UserSchema);

module.exports = User;