const Document = require('../models/Document');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

exports.uploadDocument = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    const file = req.file.path;

    const result = await cloudinary.uploader.upload(file, {
      resource_type: "raw",
      folder: "archiprof"
    });

    const doc = await Document.create({
      title,
      description,
      category,
      tags: tags ? tags.split(',') : [],
      fileUrl: result.secure_url,
      ownerId: req.userId
    });

    fs.unlinkSync(file); // borra el archivo local temporal

    res.status(201).json({ message: "Documento subido", document: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
