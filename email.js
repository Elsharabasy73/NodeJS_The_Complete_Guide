const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const API_KEY =
  "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";
const SINGLE_SENDER = "sara.momo7112@gmail.com";

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: API_KEY,
    },
  })
);
const email = "abdo.make631@gmail.com";
transporter
  .sendMail({
    to: email,
    from: SINGLE_SENDER,
    subject: "Reset your password!",
    html: `
          <h1>Ready to Reset?</h1>
          <p> [[Test]] Click this <a href='http://localhost:3000/reset/'> link </a> to set a new password</p>
          `,
  })
  .catch((err) => console.log("asdfa", err));
