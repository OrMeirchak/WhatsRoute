const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// CONFIGURABLE URL
const EXTERNAL_SERVER_URL = 'http://localhost:3000/receive-whatsapp-data';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false, // set to false so you can *see* the browser and check
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <--- important
            '--disable-gpu'
        ]
    }
});
client.on('qr', (qr) => {
    console.log('Scan the QR code below to log in:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});



client.on('message', async msg => {
    try {
        const sender = msg.from;
        console.log(`📲 Message received from: ${sender}`);

        // Voice message
        if (msg.hasMedia) {
            const media = await msg.downloadMedia();
            if (media.mimetype === 'audio/ogg; codecs=opus') {
                console.log(`🎤 Voice message from ${sender} at ${new Date().toISOString()}`);
                await sendToServer({
                    type: 'voice',
                    from: sender,
                    timestamp: msg.timestamp,
                    mimetype: media.mimetype,
                    data: media.data
                });
            }
        }

        // Location message
        if (msg.type === 'location') {
            const location = msg.location;
            console.log(`📍 Location message from ${sender} at ${new Date().toISOString()}`);
            sendMessageToServer(sender, `latitude : ${location.latitude}. longitude : ${location.longitude}. ${location.description}`);
        }

        // Text message
        if (msg.type === 'chat') {
            console.log(`💬 Text message from ${sender} at ${new Date().toISOString()}`);
            sendWhatsappMessage(sender,"bla bla")
            sendMessageToServer(sender, msg.body);
        }

    } catch (err) {
        console.error('Error handling message:', err);
    }
});

async function sendWhatsappMessage(phoneNumber, message) {
    try {
        // ודא שהמספר בפורמט בינלאומי + קוד מדינה וללא תווים נוספים
        const chatId = phoneNumber.includes('@c.us') ? phoneNumber : `${phoneNumber}@c.us`;

        await client.sendMessage(chatId, message);
        console.log(`✅ Message sent to ${phoneNumber}: "${message}"`);
    } catch (error) {                                                          
        console.error(`❌ Failed to send message to ${phoneNumber}:`, error);
    }
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                

async function sendMessageToServer(user, message) {
    const timestamp = new Date().toISOString();

    try {
        const response = await fetch('http://localhost:4000/incoming-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user,
                timestamp,
                message
            })
        });

        if (response.ok) {
            console.log('Message sent successfully');
        } else {
            console.error('Failed to send message', response.status);
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

client.initialize();
