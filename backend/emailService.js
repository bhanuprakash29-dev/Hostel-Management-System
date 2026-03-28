const SibApiV3Sdk = require('sib-api-v3-sdk');

// Configure Brevo API key
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const sendOtpEmail = async (toEmail, toName, otp) => {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
        name: process.env.BREVO_SENDER_NAME || 'EliteHostel',
        email: process.env.BREVO_SENDER_EMAIL || 'no-reply@elitehostel.com'
    };

    sendSmtpEmail.to = [{ email: toEmail, name: toName || toEmail }];
    sendSmtpEmail.subject = 'Your EliteHostel Verification Code';

    sendSmtpEmail.htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <title>Email Verification</title>
        </head>
        <body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 0;">
                <tr>
                    <td align="center">
                        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                            <!-- Header -->
                            <tr>
                                <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:36px 40px;text-align:center;">
                                    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">
                                        ELITE<span style="color:#93c5fd;">HOSTEL</span>
                                    </h1>
                                    <p style="color:#bfdbfe;margin:8px 0 0;font-size:13px;">Secure Verification System</p>
                                </td>
                            </tr>
                            <!-- Body -->
                            <tr>
                                <td style="padding:40px;">
                                    <p style="color:#374151;font-size:16px;margin:0 0 8px;">Hello, <strong>${toName || 'Student'}</strong> 👋</p>
                                    <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 28px;">
                                        You've requested to verify your email address for your EliteHostel account. Use the one-time code below. It expires in <strong>10 minutes</strong>.
                                    </p>
                                    <!-- OTP Box -->
                                    <div style="background:#eff6ff;border:2px dashed #3b82f6;border-radius:12px;padding:28px;text-align:center;margin-bottom:28px;">
                                        <p style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 12px;">Verification Code</p>
                                        <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#1d4ed8;font-family:'Courier New',monospace;">${otp}</div>
                                    </div>
                                    <p style="color:#9ca3af;font-size:13px;line-height:1.6;margin:0;">
                                        If you didn't request this, you can safely ignore this email. Someone may have typed your email address by mistake.
                                    </p>
                                </td>
                            </tr>
                            <!-- Footer -->
                            <tr>
                                <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                                    <p style="color:#9ca3af;font-size:12px;margin:0;">
                                        &copy; ${new Date().getFullYear()} EliteHostel Management System. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    try {
        const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`OTP email sent to ${toEmail}, messageId:`, result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Brevo email error:', error.response?.text || error.message);
        throw new Error('Failed to send OTP email. Please try again.');
    }
};

module.exports = { sendOtpEmail };
