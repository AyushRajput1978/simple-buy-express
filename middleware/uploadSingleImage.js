const catchAsync = require('../utils/catchAsync');
const { uploadSingle, uploadBufferToS3 } = require('./upload');

/**
 * Middleware to handle single image upload to S3.
 *
 * @param {string} folderName - The target folder in the S3 bucket.
 * @returns {Array} - Express middleware chain.
 */
exports.uploadSingleImage = (folderName) => [
  uploadSingle, // multer middleware for single image
  catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    const uploadedUrl = await uploadBufferToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folderName
    );

    req.body.image = uploadedUrl;
    next();
  }),
];
