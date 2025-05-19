const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  tags: [String],
  fileUrl: String,
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadDate: { type: Date, default: Date.now },
  convertedToPdf: { type: Boolean, default: false }
});

module.exports = mongoose.model('Document', DocumentSchema);
