const nodemailer = require('nodemailer');
const pug = require('pug');
const fs = require('fs');
const { convert } = require('html-to-text');
const AppError = require('../utils/appError');

function deleteFile(filePath, cb) {
  if (typeof cb !== 'function') {
    return next(new AppError('Callback function is not defined', 400));
  }
  fs.unlink(filePath, (err) => {
    if (err) {
      cb(err);
      return;
    }
    cb(null);
  });
}

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `mohamed ramadan <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      host: 'smtp.gmail.com',
      secure: false,
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    //IN DEVELOPMENT ONLY
    // return nodemailer.createTransport({
    //   host: process.env.EMAIL_HOST,
    //   port: process.env.EMAIL_PORT,
    //   auth: {
    //     user: process.env.EMAIL_USERNAME,
    //     pass: process.env.EMAIL_PASSWORD,
    //   },
    // });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../dev-data/templates/${template}.pug`,
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
      attachments: [
        {
          filename: 'CertificateImage.jpeg',
          path: `${__dirname}/../dev-data/img/CertificateImage.jpeg`, // Path to the image file
          cid: 'myimagecid', // Same cid value as in the html img src
          contentType: 'image/jpeg',
        },
      ],
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Eco-Friends Family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }

  async sendCertificate() {
    await this.send('certified', 'Your Certificate');
    console.log('Deleting certificate...');
    deleteFile(`${__dirname}/../dev-data/img/CertificateImage.jpeg`, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return;
      }
      console.log('File deleted successfully');
    });
  }
};
