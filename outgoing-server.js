const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// ייבוא ישיר של הפונקציה מהקובץ index.js
const { sendWhatsappMessage } = require('./index');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/send', async (req, res) => {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
        return res.status(400).json({ error: 'Missing phoneNumber or message' });
    }

    try {
        await sendWhatsappMessage(phoneNumber, message);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        res.status(500).json({ error: 'Failed to send WhatsApp message' });
    }
});

app.listen(5000, () => {
    console.log('Outgoing WhatsApp server listening on port 5000');
});
