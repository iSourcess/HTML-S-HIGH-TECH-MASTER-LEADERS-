const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const auth = require('../middlewares/authMiddleware');
const { uploadDocument } = require('../controllers/documentController');

router.post('/upload', auth, upload.single('file'), uploadDocument);

module.exports = router;
