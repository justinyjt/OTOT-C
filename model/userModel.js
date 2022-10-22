let mongoose = require('mongoose');


//Setup Schema
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  hashPassword: {
    type: String,
    required: true,
  },
  userRole: {
    type: [String],
    required: true,
  },
});

// Export Contact model
const User = mongoose.model(
  "user",
  userSchema
);

function get(callback, limit) {
    User.find(callback).limit(limit);
}

module.exports = {
    User,
    get
}