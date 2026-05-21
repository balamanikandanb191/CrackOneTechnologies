const nodemailer = require('nodemailer');
require('dotenv').config();

async function testBulkSend() {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.zoho.in',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: { rejectUnauthorized: false }
    });

    const ccListStr = "Kishore.s1704@gmail.com,santhoshkumar97427@gmail.com,bvinoth76@gmail.com,crackonetechnologies@gmail.com,hariharasudhan.k.2004@gmail.com,sarrathb@gmail.com,ranjithkumarsr2005@gmail.com,balamanikandanb191@gmail.com";
    const ccList = ccListStr.split(',').map(e => e.trim()).filter(Boolean);

    console.log("Starting bulk send test to " + ccList.length + " recipients...");

    for (const email of ccList) {
        try {
            console.log(`Sending to ${email}...`);
            await transporter.sendMail({
                from: `"CrackOne Notifications" <${process.env.SMTP_USER}>`,
                to: email,
                subject: `🚀 Bulk Test`,
                text: "This is a test to verify if Zoho allows sending to your address."
            });
            console.log(`✅ Success: ${email}`);
        } catch (e) {
            console.error(`❌ Failed: ${email}`, e.message);
        }
        // Wait 1 second between emails to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

testBulkSend();
