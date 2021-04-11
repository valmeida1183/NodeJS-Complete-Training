const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 587,
    secure: true,
    auth: {
        user: process.env.API_USER_EMAIL,
        pass: process.env.API_USER_PASSWORD,
    },
});

exports.sendEmail = configObj => {
    configObj.from = process.env.API_USER_EMAIL;

    return transporter.sendMail(configObj);
};
