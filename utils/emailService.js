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
    <div style="background: linear-gradient(to bottom, #000000, #1a1a1a); padding: 30px; font-family: Arial, sans-serif; color: #ffffff;">
      <div style="max-width: 600px; margin: auto; background: #111418; padding: 20px; border-radius: 10px; border: 1px solid #F47800;">
        <div style="text-align: center;">
          <img src="https://modovatestudio.com/logo.png" alt="Modovate Studio" style="width: 150px; margin-bottom: 20px;" />
        </div>
        <h2 style="text-align: center; color: #00B8B8;">Welcome to Modovate Studio!</h2>
        <p>Hi <strong>${username}</strong>,</p>
        <p>Thank you for registering! Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmationLink}" style="background-color: #F47800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
        </div>
        <p>If you didn't create an account, please ignore this email.</p>
        <p style="margin-top: 40px;">Best regards,<br/>The Modovate Studio Team</p>
      </div>
    </div>
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
