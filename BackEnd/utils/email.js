const nodemailer = require('nodemailer');
const pug = require('pug');
const fs = require('fs');
const { convert } = require('html-to-text');

const CERTIFICATE_IMAGE_PATH = `${__dirname}/../dev-data/img/CertificateImage.jpeg`;

// Delete a file, ignoring "already gone" and reporting anything else
// through the callback. Plain callback style, no `next` — the old
// version referenced an undefined `next` and threw a ReferenceError
// whenever it was called without a callback.
function deleteFile(filePath, cb) {
  const callback = typeof cb === 'function' ? cb : () => {};
  fs.unlink(filePath, (err) => {
    if (err) {
      callback(err);
      return;
    }
    callback(null);
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
  // options.attachCertificate: attach the generated certificate image.
  // Only certification emails pass this — the old code attached the
  // image to EVERY email (welcome, password reset, ...), which also
  // failed outright when CertificateImage.jpeg did not exist yet.
  async send(template, subject, options = {}) {
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
    };

    if (options.attachCertificate) {
      mailOptions.attachments = [
        {
          filename: 'CertificateImage.jpeg',
          path: CERTIFICATE_IMAGE_PATH, // Path to the image file
          cid: 'myimagecid', // Same cid value as in the html img src
          contentType: 'image/jpeg',
        },
      ];
    }

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
    await this.send('certified', 'Your Certificate', {
      attachCertificate: true,
    });
    deleteFile(CERTIFICATE_IMAGE_PATH, (err) => {
      if (err) {
        console.error('Error deleting certificate file:', err);
      }
    });
  }
};
