const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID, // from your .env
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // from your .env
  region: process.env.AWS_DEFAULT_REGION, // e.g., 'us-east-1'
});

module.exports = s3;
