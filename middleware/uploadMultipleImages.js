const catchAsync = require('../utils/catchAsync');
const { uploadMultiple, uploadBufferToS3 } = require('./upload');

const uploadMultipleImages = (folderName) => [
  uploadMultiple,
  catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length === 0) return next();

    const uploadedUrls = await Promise.all(
      req.files.map((file) =>
        uploadBufferToS3(file.buffer, file.originalname, file.mimetype, folderName)
      )
    );
    if (req.body.images) {
      if (Array.isArray(req.body.images)) {
        req.body.images = [...uploadedUrls, ...req.body.images];
      } else req.body.images = [...uploadedUrls, req.body.images];
    } else req.body.images = uploadedUrls;
    next();
  }),
];

module.exports = { uploadMultipleImages }; // <-- Ensure this line is present
