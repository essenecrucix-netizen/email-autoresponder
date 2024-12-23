const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    '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',
    'http://localhost'
);

const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Ensures a refresh token is returned
    scope: [
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.readonly'
    ]
});

console.log('Authorize this app by visiting this URL:', authUrl);
