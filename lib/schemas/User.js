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
  },
  gender: {
    required: true,
    // 0 = male, 1 = female
    type: Number
  },
  interests: {
    required: true,
    // 0 = men, 1 = women, 2 = both
    type: Number
  },
  bio: String,
  profilePictureUrl: String
});
var User = mongoose.model('user', UserSchema);

module.exports = User;