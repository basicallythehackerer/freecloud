const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_FOLDER = './uploads';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_FOLDER);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname); // Get the file extension
    const randomId = Math.random().toString(36).substring(2, 11); // Generate random ID
    cb(null, `${randomId}${ext}`); // Combine random ID and extension without changing the original filename
  }
});

const upload = multer({ storage: storage });

// Serve index.html only on /upload route
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileId = req.file.filename; // File ID is already generated as random letters plus extension
  const file_url = `${req.protocol}://${req.get('host')}/api/v1/${fileId}`;
  console.log(`File uploaded successfully. URL: ${file_url}`);
  res.json({ file_url: file_url });
});

// Handle file retrieval
app.get('/api/v1/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  const filePath = path.join(__dirname, UPLOAD_FOLDER, fileId); // Construct absolute path to the file

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.sendFile(filePath);
});

if (!fs.existsSync(UPLOAD_FOLDER)) {
  fs.mkdirSync(UPLOAD_FOLDER);
}

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
