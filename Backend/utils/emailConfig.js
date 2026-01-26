const nodemailer = require('nodemailer');

/**
 * Create test account using Ethereal Email
 * This is for TESTING ONLY - emails are captured but not actually sent
 */
async function createTestEmailAccount() {
    try {
        // Generate test SMTP service account from ethereal.email
        const testAccount = await nodemailer.createTestAccount();

        console.log('\n=================================================');
        console.log('📧 TEST EMAIL ACCOUNT CREATED');
        console.log('=================================================');
        console.log('Email:', testAccount.user);
        console.log('Password:', testAccount.pass);
        console.log('SMTP Host:', testAccount.smtp.host);
        console.log('SMTP Port:', testAccount.smtp.port);
        console.log('\n⚠️  This is a TEST account - emails will be captured');
        console.log('View emails at: https://ethereal.email/messages');
        console.log('=================================================\n');

        return {
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        };
    } catch (error) {
        console.error('Error creating test email account:', error);
        return null;
    }
}

module.exports = { createTestEmailAccount };
