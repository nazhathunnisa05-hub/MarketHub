const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require("../config/s3");

const getImageUrl = async (imageKey) => {
  if (!imageKey) {
    return null;
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: imageKey
  });

  return await getSignedUrl(s3, command, {
    expiresIn: 3600
  });
};

module.exports = getImageUrl;