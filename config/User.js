const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  banned: { type: Boolean, default: false },
  banReason: { type: String, default: null },
  banAt: { type: Date, default: null },
  unbanHistory: [
    {
      by: String,
      at: Date,
      reason: String
    }
  ],
  meta: { type: Object, default: {} }
});

module.exports = mongoose.model('User', UserSchema);
