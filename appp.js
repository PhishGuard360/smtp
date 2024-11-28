const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer'); // Import Nodemailer
// const { serverEvents } = require('./smtp1'); // Your SMTP event emitter

const app = express();
app.use(express.json());


// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'ramlakman98@gmail.com', // Your Gmail address
        pass: 'gzdv ston ffoj btae',   // Your Gmail app password
        // user: process.env.EMAIL_USER, // Your Gmail address
        // pass: process.env.EMAIL_PASS, // Your Gmail app password
    },
});

// API to send emails
app.post('/api/send', async (req, res) => {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
        return res.status(400).send({ message: 'Missing required fields: to, subject, or text' });
    }

    try {
        const info = await transporter.sendMail({
            from: `${subject} <ramlakman98@gmail.com>`, // Sender address
            to, // Recipient address
            subject, // Subject line
            html: text, // Plain text body
        });

        console.log('Email sent: %s', info.messageId);
        res.status(200).send({ message: 'Email sent successfully', messageId: info.messageId });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send({ message: 'Failed to send email', error });
    }
});




// Serve static HTML files from the 'smtpserverwithui' directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname , 'public', 'index.html'));
  });

// Function to check if userId is unique
function isUniqueId(userId, callback) {
    fs.readFile('user_logs.txt', 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            console.error('Error reading log file:', err);
            return callback(false); // Assume not unique if an error occurs
        }
        const isUnique = !data || !data.includes(`User ID: ${userId},`);
        callback(isUnique);
    });
}

// Endpoint to log data
app.post('https://localhost:3000/log', (req, res) => {
    const { userId, timestamp } = req.body;

    if (!userId || !timestamp) {
        return res.status(400).json({ error: 'Invalid request payload' });
    }

    isUniqueId(userId, (isUnique) => {
        if (isUnique) {
            const logEntry = `User ID: ${userId}, Timestamp: ${timestamp}\n`;
            fs.appendFile('user_logs.txt', logEntry, (err) => {
                if (err) {
                    console.error('Error writing to log file:', err);
                    return res.status(500).json({ error: 'Failed to log data' });
                }
                console.log(`Logged unique User ID: ${userId}, Timestamp: ${timestamp}`);
                return res.status(200).json({ message: 'Data logged successfully' });
            });
        } else {
            console.log(`Duplicate User ID: ${userId} was not logged.`);
            return res.status(200).json({ message: 'Duplicate User ID. No logging occurred.' });
        }
    });
});


app.get('/download-logs', (req, res) => {
    const filePath = 'C:/Users/deeks/Desktop/R&D/simulator/test/phish_site/'
    if (fs.existsSync(filePath)) {
        res.download(filePath, 'user_logs.txt', (err) => {
            if (err) {
                console.error('Error during download:', err);
                res.status(500).send('Error downloading file');
            }
        });
    } else {
        res.status(404).send('Log file not found');
    }
});


app.get('/recent-logs', (req, res) => {
    const filePath = "C:/Users/deeks/Desktop/R&D/simulator/test/phish_site/";
    if (fs.existsSync(filePath)) {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading log file:', err);
                return res.status(500).send({ error: 'Error reading log file' });
            }
            const logs = data.trim().split('\n').slice(-10); // Get the last 10 log entries
            res.status(200).send(logs);
        });
    } else {
        res.status(200).send([]); // Return empty if no logs exist
    }
});


// Start the Express app
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Express app running on port ${PORT}`));


console.log('Server is running at http://localhost:4000');
