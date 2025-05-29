const express = require('express');

const router = express.Router();
const { upload } = require('../middleware/upload');

router.post('/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imageUrl = req.file.location; // This is the S3 public URL
  res.status(200).json({
    message: 'File uploaded successfully',
    imageUrl: imageUrl,
  });
});

module.exports = router;
