const nodemailer = require('nodemailer');
const dotenv = require('dotenv').config();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = process.env.EMAIL_FROM || 'YOUR_EMAIL';
  }

  newTransport() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {

    // 2) Email mailOptions
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      text: `Please verify your email ${this.url}`,
    };

    // 3) Create a transport and send email

    await this.newTransport().sendMail(mailOptions);
  }

  //   async sendPasswordResetToken() {
  //     await this.send(
  //       'passwordReset',
  //       'Your password reset token ( valid for only 10 minutes )'
  //     );
  //   }

  async sendVerificationEmail() {
    await this.send(
      'verification',
      'Please verify your identity in order to use Movies API'
    );
  }
};
