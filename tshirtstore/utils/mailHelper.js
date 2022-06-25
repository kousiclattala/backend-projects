const nodemailer = require("nodemailer");

const mailHelper = async (options) => {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailData = {
    from: "kousiclattala112@gmail.com", // sender address
    to: options.toEmail, // list of receivers
    subject: options.subject, // Subject line
    text: options.text, // plain text body
    html: `<a href=${options.url}>Reset Password</a>`,
  };

  await transport.sendMail(mailData);
};

module.exports = mailHelper;
