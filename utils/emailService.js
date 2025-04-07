// utils/emailService.js
const { Client } = require('@microsoft/microsoft-graph-client');
const { ConfidentialClientApplication } = require('@azure/msal-node');

const msalConfig = {
  auth: {
    clientId: process.env.OUTLOOK_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}`,
    clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
  }
};

const cca = new ConfidentialClientApplication(msalConfig);

const getAccessToken = async () => {
  const result = await cca.acquireTokenByClientCredential({
    scopes: ['https://graph.microsoft.com/.default'],
  });
  return result.accessToken;
};

const sendVerificationEmail = async (recipientEmail, username, confirmationToken) => {
  const accessToken = await getAccessToken();

  const client = Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });

  const confirmationLink = `${process.env.BASE_URL}/verify-email/${confirmationToken}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en" style="margin:0;padding:0;background-color:#0b0e11;">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin:0;padding:0;background-color:#0b0e11;font-family:Arial,sans-serif;color:#d1d5db;">
        <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
          <img src="https://www.modovatestudio.com/assets/logo/Logotip_transparent_notext.png" alt="Modovate Studio Logo" style="display:block;margin:0 auto 40px;width:150px;">
          <div style="background-color:#111418;border:1px solid #F47800;border-radius:8px;padding:30px 20px;text-align:center;">
            <h1 style="color:#00B8B8;margin-bottom:20px;">Welcome to Modovate Studio!</h1>
            <p>Hi <strong>${username}</strong>,</p>
            <p>Thank you for registering! Please click the button below to verify your email address:</p>
            <div style="text-align:center;margin:30px 0;">
              <a href="${confirmationLink}" style="background-color:#F47800;color:#ffffff;padding:14px 28px;text-decoration:none;font-weight:bold;border-radius:6px;display:inline-block;">
                Verify Email
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break:break-all;"><a href="${confirmationLink}" style="color:#00B8B8;">${confirmationLink}</a></p>
            <p style="margin-top:40px;">Best regards,<br/>The Modovate Studio Team</p>
          </div>
          <div style="margin-top:40px;font-size:12px;color:#6b7280;text-align:center;">
            &copy; 2025 Modovate Studio. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  await client.api(`/users/${process.env.OUTLOOK_EMAIL}/sendMail`)
    .post({
      message: {
        subject: 'Confirm Your Modovate Studio Account',
        body: {
          contentType: 'HTML',
          content: htmlContent,
        },
        toRecipients: [
          {
            emailAddress: {
              address: recipientEmail,
            },
          },
        ],
      },
      saveToSentItems: 'false',
    });
};

module.exports = {
  sendVerificationEmail,
};
