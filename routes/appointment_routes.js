const { Router } = require("express");
const {
  send_appoinment_otp,
  resend_appointment_otp,
  verify_appointment_otp,
  send_invitation_link,
} = require("../controller/appointment");

const scheduler = require("../controller/appointment_scheduler");
const upload = require("../middlewares/multer").single("file");

const routes = Router();

routes.post("/send_otp", async (req, res) => {
  try {
    res.status(200).send(await send_appoinment_otp(req.body));
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

routes.post("/resend_otp", async (req, res) => {
  try {
    res.status(200).send(await resend_appointment_otp(req.body));
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

routes.post("/verify_otp", async (req, res) => {
  try {
    res.status(200).send(await verify_appointment_otp(req.body));
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

routes.post("/send_invite", async (req, res) => {
  try {
    res.status(200).send(await send_invitation_link(req.body));
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

routes.post("/upload_schedule", async (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).send({
        error: err.message,
      });
    }
    const csv = require("csvtojson");
    csv()
      .fromFile(req.file.path)
      .then(async (data) => {
        try {
          res.status(200).send(await scheduler.uploadSchedulerData(data));
        } catch (err) {
          res.status(400).send({
            error: err.message,
          });
        }
      })
      .catch((err) => {
        res.status(400).send({
          error: err.message,
        });
      });
  });
});

module.exports = routes;
