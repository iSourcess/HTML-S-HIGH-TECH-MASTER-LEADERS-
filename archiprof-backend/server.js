require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const multer = require('multer');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));

app.get('/', (req, res) => res.send("Servidor de Archiprof funcionando"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));

// Configuración de multer para la carga de archivos
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../uploads/') // Carpeta fuera del directorio del usuario
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

// Endpoint para subir archivos
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha subido ningún archivo' });
        }
        
        res.status(200).json({
            message: 'Archivo subido correctamente',
            filename: req.file.filename,
            path: req.file.path
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al subir el archivo', error: error.message });
    }
});
