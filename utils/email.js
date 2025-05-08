const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  // 1) Create transpoter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  // 2) Define email options
  const mailOptions = {
    from: 'Ayush Rajput <7827970092a@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) Actually send the mail
  await transporter.sendMail(mailOptions);
};
module.exports = sendMail;
