const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON data
app.use(bodyParser.json());

// Correct local path to the image file using path.resolve()
const imagePath = path.resolve(__dirname, 'kalburagitech.jpg');
const userDataPath = path.resolve(__dirname, 'user.json');

// Email sending service with attachment
const sendEmail = (emailRequest) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,  // Your email id
            pass: process.env.EMAIL_PASSWORD   // Your password
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: emailRequest.email,
        subject: 'Welcome to Kalaburagi Tech - Project Submission Details',
        text: `Hello ${emailRequest.username},\n\nWelcome to Kalaburagi Tech!\n\n` +
              `Thank you for submitting your project. Here are the details:\n\n` +
              `Name: ${emailRequest.username}\n` +
              `Email: ${emailRequest.email}\n` +
              `Phone: ${emailRequest.phone}\n` +
              `WhatsApp: ${emailRequest.whatsapp}\n` +
              `Project Name: ${emailRequest.projectName}\n` +
              `Programming Language: ${emailRequest.language}\n` +
              `Description: ${emailRequest.description}\n\n` +
              `If you have any questions or need further assistance, feel free to contact us at 9880020224.\n\n` +
              `Best regards,\nKalaburagi Tech`,
        attachments: [
            {
                filename: 'kalburagitech.jpg',
                path: imagePath,
                cid: 'kalburagitech@cid' // For embedding the image, if needed
            }
        ]
    };

    return transporter.sendMail(mailOptions);
};

// Route to handle email sending and save user data
app.post('/api/email-send', async (req, res) => {
    try {
        const emailRequest = req.body;

        // Send email
        await sendEmail(emailRequest);

        // Save user data to user.json
        fs.writeFile(userDataPath, JSON.stringify(emailRequest, null, 2), (err) => {
            if (err) {
                console.error('Error saving user data:', err);
                return res.status(500).send('Error saving user data');
            }
            res.status(200).send('Email sent and data saved successfully');
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email');
    } 
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
