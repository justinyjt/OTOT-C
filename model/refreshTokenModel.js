let mongoose = require("mongoose");

// Setup schema
const refreshTokenSchema = new mongoose.Schema({
  rtoken: {
    type: String,
    required: true,
  },
});

// Export Contact model
const RefreshToken = mongoose.model(
  "RefreshToken",
  refreshTokenSchema
);
module.exports = { refreshTokenSchema, RefreshToken }; 