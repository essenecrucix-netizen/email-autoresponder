const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    'YOUR_GOOGLE_CLIENT_ID',
    'YOUR_GOOGLE_CLIENT_SECRET',
    'http://localhost'
);

async function getTokens(authCode) {
    const { tokens } = await oauth2Client.getToken(authCode);
    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);
}

// Replace 'YOUR_AUTHORIZATION_CODE' with the code you received
getTokens('4/0AanRRrutb1JAZPAzgFASP3x3ZawyYbExfQDcFyQ4P0g6_XS8k1gxbmljO9iwyzoR403hGw');
