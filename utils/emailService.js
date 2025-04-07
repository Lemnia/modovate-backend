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
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" bgcolor="#0b0e11" style="background-color: #0b0e11;">
        <tr>
          <td align="center">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px;">
              <tr>
                <td style="padding: 30px 0; background-color: #111418; text-align: center;">
                  <img src="https://www.modovatestudio.com/assets/logo/Logotip_transparent_notext.png" alt="Modovate Studio" width="150" style="display: block; margin: auto;">
                </td>
              </tr>

              <tr>
                <td style="background-color: #111418; padding: 40px 30px; border: 1px solid #F47800; border-top: none; border-bottom: none; text-align: center; color: #ffffff; font-family: Arial, sans-serif;">
                  <h1 style="color: #00B8B8; font-size: 28px; margin-bottom: 20px;">Welcome to Modovate Studio!</h1>
                  <p style="font-size: 16px; line-height: 24px; margin-bottom: 30px;">
                    Hi <strong>${username}</strong>,<br><br>
                    Thank you for registering! Please click the button below to verify your email address:
                  </p>

                  <a href="${confirmationLink}" style="background-color: #F47800; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 5px; display: inline-block; margin-bottom: 20px;">
                    Verify Email
                  </a>

                  <p style="font-size: 14px; color: #cccccc; margin-top: 20px;">
                    If the button above doesn't work, please click the link below:<br>
                    <a href="${confirmationLink}" style="color: #00B8B8; word-break: break-all;">${confirmationLink}</a>
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background-color: #0b0e11; padding: 20px; text-align: center; font-family: Arial, sans-serif; font-size: 12px; color: #888888;">
                  © 2025 Modovate Studio. All rights reserved.<br>
                  You received this email because you registered on Modovate Studio.
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
