import aws from "aws-sdk";
import { createReadStream } from "fs";

let {
  AWS_ACCESS_KEY: accessKeyId,
  AWS_IMAGE_BUCKET_NAME: bucketName,
  AWS_SECRET_KEY: secretAccessKey,
} = process.env;

aws.config.update({
  accessKeyId,
  secretAccessKey,
});

export const uploadToS3 = async (file, path) => {
  try {
    const fileStream = createReadStream(file.path || file);
    const s3 = new aws.S3();
    const data = await s3
      .upload({
        Bucket: bucketName,
        Body: fileStream,
        Key: `${path}/${file.originalname}`,
        ContentType: file.mimetype,
      })
      .promise();
    return [true, data];
  } catch (err) {
    console.error(err);
    return [false, err];
  }
};
