#!/usr/bin/env node
/*
 test.js - Send a single test email using nodemailer and the credentials below.

 WARNING: This file contains plaintext credentials. Do NOT commit this file to a public repo.
 For Gmail, prefer an App Password (when 2FA is enabled) or use environment variables instead.
 Install nodemailer: npm install nodemailer
 Run: node test.js
*/

const nodemailer = require('nodemailer');

// Credentials (kept here per your request)
const senderEmail = "abdo.make631@gmail.com";
const senderPassword = "jiul lrla xdjd wsgu";

// Recipient requested
const recipient = "abdo.make73@gmail.com";

async function sendTestEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465
    auth: {
      user: senderEmail,
      pass: senderPassword,
    },
  });

  try {
    await transporter.verify();
    console.log('SMTP connection verified.');
  } catch (err) {
    console.warn('SMTP verify failed:', err && err.message ? err.message : err);
    console.warn('If you use Gmail, ensure you used an App Password or that SMTP access is allowed.');
  }

  const mailOptions = {
    from: senderEmail,
    to: recipient,
    subject: 'Test email from test.js',
    text: 'Hello — this is a test email sent from test.js using nodemailer.',
    html: '<p>Hello — this is a <strong>test</strong> email sent from <code>test.js</code>.</p>',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    if (info.accepted && info.accepted.length) console.log('Accepted:', info.accepted.join(', '));
    if (info.rejected && info.rejected.length) console.warn('Rejected:', info.rejected.join(', '));
  } catch (err) {
    console.error('Send failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

sendTestEmail();
