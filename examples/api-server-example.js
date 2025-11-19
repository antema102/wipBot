/**
 * Exemple de serveur API simple pour recevoir les CVs
 * Ce serveur peut être utilisé pour tester le bot
 * 
 * Usage: node examples/api-server-example.js
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration
const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, '../uploads');

// Créer le dossier d'upload s'il n'existe pas
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configuration de multer pour gérer les uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Créer l'application Express
const app = express();

// Middleware pour parser le JSON
app.use(express.json());

// Route de santé
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Server is running' });
});

// Route pour recevoir les CVs
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
    }

    // Extraire les métadonnées
    const metadata = {
      emailFrom: req.body.emailFrom || 'Unknown',
      emailSubject: req.body.emailSubject || 'No subject',
      emailDate: req.body.emailDate || new Date().toISOString(),
      attachmentFilename: req.body.attachmentFilename || req.file.originalname,
      attachmentSize: req.body.attachmentSize || req.file.size,
      attachmentType: req.body.attachmentType || req.file.mimetype
    };

    // Afficher les informations
    console.log('\n📄 CV reçu:');
    console.log('  Fichier:', req.file.filename);
    console.log('  Taille:', (req.file.size / 1024).toFixed(2), 'KB');
    console.log('  Type:', req.file.mimetype);
    console.log('  De:', metadata.emailFrom);
    console.log('  Sujet:', metadata.emailSubject);
    console.log('  Date:', metadata.emailDate);
    console.log('  Sauvegardé dans:', req.file.path);
    console.log('');

    // Répondre avec succès
    res.json({
      success: true,
      message: 'CV received successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      },
      metadata: metadata
    });

  } catch (error) {
    console.error('Erreur lors du traitement:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Route pour lister les CVs reçus
app.get('/cvs', (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }

    const cvs = files.map(filename => ({
      filename: filename,
      path: path.join(UPLOAD_DIR, filename),
      stats: fs.statSync(path.join(UPLOAD_DIR, filename))
    }));

    res.json({
      success: true,
      count: cvs.length,
      cvs: cvs
    });
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log('=================================');
  console.log('  API Server Example');
  console.log('=================================');
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Upload endpoint: POST http://localhost:${PORT}/upload`);
  console.log(`✓ List CVs: GET http://localhost:${PORT}/cvs`);
  console.log(`✓ Health check: GET http://localhost:${PORT}/health`);
  console.log(`✓ Uploads saved to: ${UPLOAD_DIR}`);
  console.log('=================================\n');
  console.log('Waiting for CVs...\n');
});
