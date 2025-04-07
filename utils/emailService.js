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
  <body style="margin: 0; padding: 0; background-color: #0b0e11;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#0b0e11">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px;">

            <!-- HEADER -->
            <tr>
              <td style="background-image: url('https://www.modovatestudio.com/assets/email/header-background.png'); background-size: cover; background-position: center; padding: 120px 0;">
                <!-- Logo is integrated into background image -->
              </td>
            </tr>

            <!-- MAIN CONTENT -->
            <tr>
              <td style="background-color: #111418; padding: 40px 30px; border: 1px solid #F47800; border-top: none; text-align: center; font-family: Arial, sans-serif; color: #ffffff;">
                
                <h1 style="color: #00B8B8; font-size: 34px; font-weight: 900; text-shadow: 1px 1px 2px #000000; margin-bottom: 30px;">
                  Welcome to Modovate Studio!
                </h1>

                <p style="font-size: 16px; line-height: 28px; margin-bottom: 25px;">
                  Hi <strong>${username}</strong>,
                </p>

                <p style="font-size: 16px; line-height: 28px; margin-bottom: 30px;">
                  We are thrilled to welcome you to <strong>Modovate Studio</strong> — the home of creativity, innovation, and endless possibilities.
                </p>

                <p style="font-size: 16px; line-height: 28px; margin-bottom: 30px;">
                  Please confirm your email address to activate your account and start exploring everything we have prepared for you.
                </p>

                <a href="${confirmationLink}" style="background-color: #F47800; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block; margin-bottom: 30px; font-size: 16px;">
                  Verify My Email
                </a>

                <p style="font-size: 12px; color: #cccccc; margin-top: 20px; line-height: 22px;">
                  If the button above doesn't work, simply copy and paste the following link into your browser:
                </p>

                <p style="font-size: 12px; color: #00B8B8; word-break: break-word; margin-top: 10px;">
                  <a href="${confirmationLink}" style="color: #00B8B8;">${confirmationLink}</a>
                </p>

              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background-color: #0b0e11; padding: 20px; text-align: center; font-family: Arial, sans-serif; font-size: 12px; color: #888888;">
                © 2025 Modovate Studio. All rights reserved.<br>
                You are receiving this email because you created an account on <strong>Modovate Studio</strong>.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
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
