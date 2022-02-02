import aws from "aws-sdk";
const axios = require("axios");
// Load your AWS credentials and try to instantiate the object.
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: "ap-south-1",
});
// Instantiate SES.
var ses = new aws.SES();
const sendMail = async (mails, bodycontent) => {
  console.log("i am here for test");
  return new Promise(async (resolve, rejects) => {
    if (Array.isArray(mails)) {
      Promise.all(
        mails.map(async (mail) => {
          var ses_mail = "From:" + process.env.senderemail + "\n";
          ses_mail = ses_mail + "To: " + mail.to + "\n";
          ses_mail = ses_mail + "Subject: " + mail.subject + "  \n";
          ses_mail = ses_mail + "MIME-Version: 1.0\n";
          ses_mail =
            ses_mail + 'Content-Type: multipart/mixed; boundary="NextPart"\n\n';
          ses_mail = ses_mail + "--NextPart\n";
          ses_mail = ses_mail + "Content-Type: text/html; charset=us-ascii\n\n";
          ses_mail = ses_mail + bodycontent + "\n\n";
          var params = {
            RawMessage: { Data: new Buffer.from(ses_mail) },
            Destinations: [mail.to],
          };
          // console.log('What I got in Mailer:\n',
          //     mail.to,
          //     mail.message,
          //     mail.slack_token,
          //     mail.push_message,
          //     mail.notification,
          //     mail.company_id,
          //     mail.url
          // )
          return new Promise(async (resolve, reject) => {
            //Send email notification
            ses.sendRawEmail(params, async function (err, data) {
              if (err) {
                console.log("====Mail Not Sent to :" + mail.to + "====");
                console.log(err);
                // sendErrToProdIssue("NOTIFY-AWS Mailer", process.env.NODE_ENV, err, new Date(), params)
                reject();
              } else {
                console.log("====Mail Sent to :" + mail.to + "====");
                console.log(data);
              }
            });

            resolve();
          });
        })
      )
        .then(() => resolve())
        .catch((err) => {
          console.log(err);
          sendErrToProdIssue(
            "NOTIFY-Mailer Async",
            process.env.NODE_ENV,
            err,
            new Date(),
            mails
          );
          rejects();
        });
    }
  });
};

const SendMail = (mails, bodycontent) => {
  let token =
    "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";
  return new Promise(async (resolve, reject) => {
    if (Array.isArray(mails)) {
      Promise.all(
        mails.map(async (mail) => {
          let data = {
            personalizations: [
              {
                to: [
                  {
                    email: mail.to,
                  },
                ],
              },
            ],
            from: {
              email: "Stylori <alert@stylori.com>", //process.env.senderemail,
            },
            subject: mail.subject,
            content: [
              {
                type: "text/html",
                value: bodycontent,
              },
            ],
          };
          return axios
            .post("https://api.sendgrid.com/v3/mail/send", data, {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })
            .then((response) => {
              console.log("====Mail Sent to :" + mail.to + "====");
              console.log(response.status, response.statusText);
              console.log(mail.to, response.headers["x-message-id"]);
              return Promise.resolve({
                mail: mail.to,
                message_id: response.headers["x-message-id"],
              });
              //   console.log(response.data);
            })
            .catch((err) => {
              console.log("====Mail Not Sent to :" + mail.to + "====");
              console.log(err);
              return Promise.reject(err);
            });
        })
      )
        .then((result) => {
          resolve({ status: "done", response: result });
        })
        .catch((err) => {
          console.log(err);
          sendErrToProdIssue(
            "NOTIFY-Mailer Async",
            process.env.NODE_ENV,
            err,
            new Date(),
            mails
          );
          reject();
        });
    }
  });
};

let send_sms = ({ mobile_no, msg_txt, sender_id }) => {
  return new Promise((resolve, reject) => {
    const axios = require("axios");
    axios({
      method: "POST",
      url: "https://staging.stylori.com/nac_api/send_sms",
      data: {
        sender_id,
        mobile_no,
        msg_txt,
      },
    })
      .then(({ data }) => {
        console.log(mobile_no, data);
        resolve(data);
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  });
};

module.exports = { sendMail: SendMail, send_sms };
