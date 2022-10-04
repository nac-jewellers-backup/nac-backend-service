const { Router } = require("express");
const {
  send_appoinment_otp,
  resend_appointment_otp,
  verify_appointment_otp,
  send_invitation_link,
} = require("../controller/appointment");

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

module.exports = routes;
