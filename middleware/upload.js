const multer = require('multer');
const s3 = require('../utils/s3'); // Assuming your s3 configuration is in utils/s3.js

// Configure multer to store files in memory
// This allows us to access the file buffer in the controller
// before deciding to upload it to S3.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB (adjust as needed)
  },
  fileFilter: (req, file, cb) => {
    // Basic validation to ensure only image files are accepted
    if (file.mimetype.startsWith('image/')) {
      cb(null, true); // Accept the file
    } else {
      // Reject the file and provide an error message
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

/**
 * Uploads a file buffer to AWS S3.
 *
 * @param {Buffer} buffer - The file buffer to upload.
 * @param {string} originalname - The original name of the file.
 * @param {string} mimetype - The MIME type of the file.
 * @returns {Promise<string>} - A promise that resolves with the S3 public URL of the uploaded file.
 * @throws {Error} - Throws an error if the S3 upload fails.
 */
const uploadBufferToS3 = async (buffer, originalname, mimetype, folder) => {
  if (!folder) {
    throw new Error(
      'S3 upload folder must be specified (e.g., "product-images" or "profile-images").'
    );
  }

  // Generate a unique file name for S3 to prevent collisions,
  // dynamically placing it in the specified folder.
  const fileName = `${folder}/${Date.now().toString()}-${originalname}`;

  // Parameters for the S3 upload operation
  const params = {
    Bucket: process.env.AWS_BUCKET, // Your S3 bucket name from environment variables
    Key: fileName, // The path and name of the file in S3
    Body: buffer, // The file content as a buffer
    ContentType: mimetype, // The MIME type of the file
  };

  try {
    // Perform the S3 upload and await the result
    const data = await s3.upload(params).promise();
    return data.Location; // Return the public URL of the uploaded file
  } catch (err) {
    console.error('Error uploading to S3:', err);
    // Re-throw a more user-friendly error
    throw new Error('Failed to upload image to S3');
  }
};

/**
 * Deletes a file from AWS S3 given its public URL.
 *
 * @param {string} fileUrl - The public URL of the file to delete from S3.
 * @returns {Promise<void>} - A promise that resolves when the file is deleted.
 */
const deleteFileFromS3 = async (fileUrl) => {
  if (!fileUrl) {
    return; // No URL provided, nothing to delete
  }

  // Extract the S3 Key from the URL using URL object
  const url = new URL(fileUrl);
  const key = decodeURIComponent(url.pathname.slice(1)); // strips leading '/' → gives 'product-images/filename.jpg'

  const params = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
  };

  try {
    await s3.deleteObject(params).promise();
    console.log(`Successfully deleted ${key} from S3.`);
  } catch (err) {
    console.error(`Error deleting ${key} from S3:`, err);
    // Optionally throw or just log depending on your needs
  }
};

// Export both the multer middleware and the S3 upload utility function, and the delete function
module.exports = { upload, uploadBufferToS3, deleteFileFromS3 };
