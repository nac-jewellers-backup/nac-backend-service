const AWS = require("aws-sdk");
const Sharp = require("sharp");
const path = require("path");
const mime = require("mime-types");

const S3 = new AWS.S3();

const TARGET_BUCKET = process.env.AWS_IMAGE_BUCKET_NAME;

const upload = require("../middlewares/multer").fields([
  {
    name: "mobile_img",
    maxCount: 1,
  },
  { name: "web_img", maxCount: 1 },
]);

function put(body, key, bucket) {
  return new Promise((resolve, reject) => {
    S3.upload(
      {
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: mime.contentType("webp"),
        CacheControl: "max-age=604800,must-revalidate",
      },
      (error, data) => {
        if (error) {
          console.log(error, error.stack, data);
          return reject(error);
        } else {
          return resolve(data);
        }
      }
    );
  });
}

export const banner_image_uploder = (req, res) => {
  try {
    upload(req, res, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send(err);
      }
      Promise.all(
        Object.keys(req.files).map((item) => {
          return new Promise(async (resolve, reject) => {
            if (req.files[item].length) {
              let { filename, path: filePath } = req.files[item][0];
              const keyExt = path.extname(filename);
              const keyWebp = `banners/${item.replace("_img", "")}/${filename
                .replace(/[&\/\\#, +()$~%'":*?<>{}]/g, "-")
                .replace(keyExt, ".webp")}`;
              let buffer = await Sharp(filePath)
                .webp({ quality: 60 })
                .toBuffer();
              put(buffer, keyWebp, TARGET_BUCKET)
                .then((result) => {
                  resolve({
                    [item.replace("_img", "")]: result.Location,
                  });
                })
                .catch(reject);
            } else {
              resolve({ [item.replace("_img")]: {} });
            }
          });
        })
      )
        .then((body) => {
          res.status(200).send(
            body.reduce((prev, next) => {
              return Object.assign({}, prev, next);
            }, {})
          );
        })
        .catch((error) => {
          console.log(error);
          res.status(500).send(error);
        });
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
};
