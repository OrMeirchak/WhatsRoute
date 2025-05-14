const express = require('express');
const bodyParser = require('body-parser');
const { client, sendWhatsappMessage } = require('./index'); // ודא שהפונקציות האלה export-ed

const app = express();
const PORT = 5000;

app.use(bodyParser.json());

app.post('/send', async (req, res) => {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
        return res.status(400).json({ error: 'Missing phoneNumber or message' });
    }

    try {
        await sendWhatsappMessage(phoneNumber, message);
        res.status(200).json({ status: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

app.listen(PORT, () => {
    console.log(`📤 Outgoing WhatsApp server listening on port ${PORT}`);
});
module.exports = {
    client,
    sendWhatsappMessage
};