import { createTemplate } from "./notify/email_templates";
import { uploadToS3 } from "./utils";
const { sendMail } = require("../controller/notify/user_notify");

const models = require("../models");

export const uploadResumetoAWS = (req, res) => {
  uploadToS3(req.file, `careers`)
    .then(async (result) => {
      let resume = await addResume({
        ...req.body,
        resume_url: result[1].Location,
      });
      res.status(200).send(resume);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
};

export const addResume = ({ name, email_id, mobile_no, resume_url }) => {
  return new Promise((resolve, reject) => {
    models.career
      .create({ name, email_id, mobile_no, resume_url })
      .then(async (result) => {
        let subject = "Resume recieved";
        var emilreceipiants = [
          {
            to: email_id,
            subject,
          },
          {
            to: "care@nacjewellers.com",
            subject,
          },
        ];
        await sendMail(
          emilreceipiants,
          await createTemplate({
            type: "nac_resume",
            data: {
              name,
              email_id,
              mobile_no,
              resume_url,
            },
          })
        );
        resolve(result);
      })
      .catch((err) => {
        console.log("ERROR::addResume");
        reject(err);
      });
  });
};
