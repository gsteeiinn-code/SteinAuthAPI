const mongoose = require('mongoose');

const InviteSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  createdBy: { type: String, default: null }, // admin or system
  createdAt: { type: Date, default: Date.now },
  used: { type: Boolean, default: false },
  usedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  usedAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null }, // optional
  meta: { type: Object, default: {} } // any extra info
});

module.exports = mongoose.model('Invite', InviteSchema);
