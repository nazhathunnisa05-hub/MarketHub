
const {
  PutObjectCommand,
  GetObjectCommand
} = require("@aws-sdk/client-s3");

const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");
const path = require("path");

const s3 = require("../config/s3");

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image"
      });
    }

    const extension = path.extname(req.file.originalname).toLowerCase();

    const fileName = `products/${crypto.randomUUID()}${extension}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    });

    await s3.send(command);

    const imageUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: fileName
      }),
      { expiresIn: 3600 }
    );

    return res.status(200).json({
      message: "Image uploaded successfully",
      key: fileName,
      imageUrl
    });

  } catch (error) {
    console.error("Image upload error:", error.name);
    console.error("Error message:", error.message);
    console.error("AWS error:", error.$metadata);

    return res.status(500).json({
      message: "Image upload failed",
      error: error.message
    });
  }
};

module.exports = { uploadImage };
