const config = require('config');
let nodemailer = require('nodemailer');

/**
 * Sends a letter with the subject "subject" and the html-text "html"
 * to the email address "email".
 *
 * @param {String} email
 * @param {String} subject
 * @param {String} html
 * @returns {Promise}
 */
exports.send = function(email, subject, html) {

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.get('nodemailer:user'),
            pass: config.get('nodemailer:pass')
        }
    });

    let mailOptions = {
        from: config.get('nodemailer:user'),
        to: email,
        subject: subject,
        html: html
    };

    return new Promise(function (resolve, reject) {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) reject(err);
            else resolve(info);
        });
    });
};