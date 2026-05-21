const { DynamoDBClient, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");
require('dotenv').config();

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
});

async function check() {
    try {
        const data = await client.send(new DescribeTableCommand({ TableName: "clientproject-users" }));
        console.log("KeySchema:", JSON.stringify(data.Table.KeySchema, null, 2));
    } catch (e) {
        console.error(e);
    }
}
check();
