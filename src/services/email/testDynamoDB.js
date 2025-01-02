require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamodb = new AWS.DynamoDB();

dynamodb.listTables({}, (err, data) => {
    if (err) {
        console.error("Unable to list tables. Error:", JSON.stringify(err, null, 2));
    } else {
        console.log("Tables:", JSON.stringify(data.TableNames, null, 2));
    }
});
