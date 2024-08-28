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

// Path to the JSON file where user data will be saved
const userDataPath = path.join(__dirname, 'user.json');

// Email sending service
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
        subject: 'Project Submission Details',
        text: `Name: ${emailRequest.username}\nEmail: ${emailRequest.email}\nPhone: ${emailRequest.phone}\nWhatsApp: ${emailRequest.whatsapp}\nProject Name: ${emailRequest.projectName}\nProgramming Language: ${emailRequest.language}\nDescription: ${emailRequest.description}`
    };

    return transporter.sendMail(mailOptions);
};

// Route to handle email sending and save data to user.json
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

// Route to get saved user data
app.get('/api/users', (req, res) => {
    fs.readFile(userDataPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading user data:', err);
            return res.status(500).send('Error reading user data');
        }
        res.status(200).json(JSON.parse(data));
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
