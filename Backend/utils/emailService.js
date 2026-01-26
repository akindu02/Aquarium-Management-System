const nodemailer = require('nodemailer');
const { createTestEmailAccount } = require('./emailConfig');

/**
 * Email Service - Handles sending emails
 */
class EmailService {
    constructor() {
        this.transporter = null;
        this.isTestMode = false;
        // Store the initialization promise so we can wait for it
        this.initPromise = this.initializeTransporter();
    }

    /**
     * Initialize email transporter
     */
    async initializeTransporter() {
        try {
            // Check if production email credentials are configured
            const hasProductionConfig =
                process.env.EMAIL_USER &&
                process.env.EMAIL_PASSWORD &&
                process.env.EMAIL_USER !== 'your-email@gmail.com' &&
                process.env.EMAIL_PASSWORD !== 'your-app-password';

            if (hasProductionConfig) {
                // Use production Gmail SMTP
                this.transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    port: parseInt(process.env.EMAIL_PORT),
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
                console.log('✅ Email service initialized (Production Mode)');
            } else {
                // Use test email account for development
                console.log('⚠️  Production email not configured. Attempting to use TEST mode (Ethereal)...');

                try {
                    const testConfig = await createTestEmailAccount();
                    if (testConfig) {
                        this.transporter = nodemailer.createTransport(testConfig);
                        this.isTestMode = true;
                        console.log('✅ Email service initialized (TEST Mode - Ethereal)');
                    } else {
                        throw new Error('Test config is null');
                    }
                } catch (err) {
                    // FALLBACK: If Ethereal fails (e.g. network issue), use a "Console Transport"
                    console.error('❌ Failed to connect to Ethereal Email. Falling back to CONSOLE MODE.');
                    this.isConsoleMode = true;
                    this.transporter = {
                        sendMail: async (options) => {
                            console.log('\n📧 ================= CONSOLE EMAIL =================');
                            console.log(`To: ${options.to}`);
                            console.log(`Subject: ${options.subject}`);
                            console.log('--------------------------------------------------');
                            console.log('Content Preview (HTML):');
                            // Extract OTP for easy reading
                            const otpMatch = options.html.match(/class="otp-code">(\d+)<\/div>/);
                            if (otpMatch) {
                                console.log(`\n🔑 YOUR OTP CODE IS: ${otpMatch[1]}\n`);
                            } else {
                                console.log(options.html.substring(0, 200) + '...');
                            }
                            console.log('==================================================\n');
                            return { messageId: 'console-mock-id' };
                        }
                    };
                    console.log('✅ Email service initialized (CONSOLE Mode - Check terminal for OTPs)');
                }
            }
        } catch (error) {
            console.error('❌ Failed to initialize email service:', error.message);
        }
    }

    /**
     * Send password reset email
     * @param {string} to - Recipient email
     * @param {string} resetToken - Password reset token (6-digit OTP)
     * @param {string} userName - User's name
     */
    async sendPasswordResetEmail(to, resetToken, userName) {
        // Wait for initialization to complete
        await this.initPromise;

        if (!this.transporter) {
            console.error('❌ Transporter not initialized');
            throw new Error('Email service not available');
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: to,
            subject: 'Password Reset Request - Aquarium Management',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 30px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                            color: #ffffff;
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 600;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .greeting {
                            font-size: 18px;
                            color: #1f2937;
                            margin-bottom: 20px;
                        }
                        .message {
                            color: #4b5563;
                            margin-bottom: 30px;
                            font-size: 16px;
                        }
                        .otp-container {
                            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                            border: 2px dashed #06b6d4;
                            border-radius: 10px;
                            padding: 25px;
                            text-align: center;
                            margin: 30px 0;
                        }
                        .otp-label {
                            color: #0891b2;
                            font-size: 14px;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-bottom: 10px;
                        }
                        .otp-code {
                            font-size: 36px;
                            font-weight: 700;
                            color: #0c4a6e;
                            letter-spacing: 8px;
                            font-family: 'Courier New', monospace;
                        }
                        .expiry-notice {
                            background-color: #fef3c7;
                            border-left: 4px solid #f59e0b;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 5px;
                        }
                        .expiry-notice p {
                            margin: 0;
                            color: #92400e;
                            font-size: 14px;
                        }
                        .warning {
                            background-color: #fee2e2;
                            border-left: 4px solid #ef4444;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 5px;
                        }
                        .warning p {
                            margin: 0;
                            color: #991b1b;
                            font-size: 14px;
                        }
                        .footer {
                            background-color: #f9fafb;
                            padding: 20px 30px;
                            text-align: center;
                            border-top: 1px solid #e5e7eb;
                        }
                        .footer p {
                            margin: 5px 0;
                            font-size: 13px;
                            color: #6b7280;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🐠 Aquarium Management</h1>
                        </div>
                        <div class="content">
                            <p class="greeting">Hello ${userName},</p>
                            <p class="message">
                                We received a request to reset your password. To proceed with resetting your password, 
                                please use the following verification code:
                            </p>
                            
                            <div class="otp-container">
                                <div class="otp-label">Your Verification Code</div>
                                <div class="otp-code">${resetToken}</div>
                            </div>

                            <div class="expiry-notice">
                                <p><strong>⏰ Important:</strong> This code will expire in 15 minutes for security reasons.</p>
                            </div>

                            <div class="warning">
                                <p><strong>🔒 Security Notice:</strong> If you didn't request a password reset, please ignore this email 
                                or contact support if you have concerns about your account security.</p>
                            </div>
                        </div>
                        <div class="footer">
                            <p><strong>Aquarium Management System</strong></p>
                            <p>This is an automated message, please do not reply to this email.</p>
                            <p>&copy; ${new Date().getFullYear()} Aquarium Management. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Password reset email sent:', info.messageId);

            // In test mode, show preview URL
            if (this.isTestMode) {
                const previewUrl = nodemailer.getTestMessageUrl(info);
                console.log('\n📧 ==================================');
                console.log('🔗 VIEW EMAIL IN BROWSER:');
                console.log(previewUrl);
                console.log('====================================\n');
            }

            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error sending password reset email:', error);

            // FALLBACK FOR DEV: If sending fails, print OTP to console so dev isn't stuck
            if (process.env.NODE_ENV === 'development') {
                console.log('\n🚨 EMAIL SEND FAILED - FALLBACK TO CONSOLE 🚨');
                console.log('--------------------------------------------------');
                console.log(`To: ${to}`);
                console.log(`Validation Code: ${resetToken}`);
                console.log('--------------------------------------------------\n');
                return { success: true, messageId: 'fallback-console' };
            }

            throw new Error('Failed to send password reset email');
        }
    }

    /**
     * Send password reset confirmation email
     * @param {string} to - Recipient email
     * @param {string} userName - User's name
     */
    async sendPasswordResetConfirmation(to, userName) {
        // Wait for initialization to complete
        await this.initPromise;

        if (!this.transporter) {
            console.error('❌ Transporter not initialized');
            return { success: false, error: 'Email service not available' };
        }

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: to,
            subject: 'Password Successfully Reset - Aquarium Management',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: 'Arial', sans-serif;
                            line-height: 1.6;
                            color: #333;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 30px auto;
                            background-color: #ffffff;
                            border-radius: 10px;
                            overflow: hidden;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                            color: #ffffff;
                            padding: 30px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 28px;
                            font-weight: 600;
                        }
                        .content {
                            padding: 40px 30px;
                        }
                        .success-icon {
                            text-align: center;
                            font-size: 64px;
                            margin-bottom: 20px;
                        }
                        .greeting {
                            font-size: 18px;
                            color: #1f2937;
                            margin-bottom: 20px;
                        }
                        .message {
                            color: #4b5563;
                            margin-bottom: 20px;
                            font-size: 16px;
                        }
                        .warning {
                            background-color: #fee2e2;
                            border-left: 4px solid #ef4444;
                            padding: 15px;
                            margin: 20px 0;
                            border-radius: 5px;
                        }
                        .warning p {
                            margin: 0;
                            color: #991b1b;
                            font-size: 14px;
                        }
                        .footer {
                            background-color: #f9fafb;
                            padding: 20px 30px;
                            text-align: center;
                            border-top: 1px solid #e5e7eb;
                        }
                        .footer p {
                            margin: 5px 0;
                            font-size: 13px;
                            color: #6b7280;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🐠 Aquarium Management</h1>
                        </div>
                        <div class="content">
                            <div class="success-icon">✅</div>
                            <p class="greeting">Hello ${userName},</p>
                            <p class="message">
                                Your password has been successfully reset. You can now log in to your account using your new password.
                            </p>
                            <p class="message">
                                If you continue to have problems signing in, please contact our support team.
                            </p>
                            <div class="warning">
                                <p><strong>🔒 Security Alert:</strong> If you did not make this change, 
                                please contact support immediately to secure your account.</p>
                            </div>
                        </div>
                        <div class="footer">
                            <p><strong>Aquarium Management System</strong></p>
                            <p>This is an automated message, please do not reply to this email.</p>
                            <p>&copy; ${new Date().getFullYear()} Aquarium Management. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('✅ Password reset confirmation email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('❌ Error sending confirmation email:', error);
            // Don't throw error here as password is already reset
            return { success: false, error: error.message };
        }
    }
}

module.exports = new EmailService();
