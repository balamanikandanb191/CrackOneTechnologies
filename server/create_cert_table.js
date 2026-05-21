const { DynamoDBClient, CreateTableCommand, DescribeTableCommand } = require("@aws-sdk/client-dynamodb");
require('dotenv').config();

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
});

const tableName = "clientproject-certificates";

async function createTable() {
    try {
        console.log(`Checking if table ${tableName} exists...`);
        try {
            await client.send(new DescribeTableCommand({ TableName: tableName }));
            console.log(`✅ Table ${tableName} already exists.`);
            return;
        } catch (err) {
            if (err.name !== 'ResourceNotFoundException') {
                console.error("❌ Error checking table:", err.message);
                return;
            }
        }

        console.log(`Creating table ${tableName}...`);
        const params = {
            TableName: tableName,
            KeySchema: [
                { AttributeName: "certificateId", KeyType: "HASH" } 
            ],
            AttributeDefinitions: [
                { AttributeName: "certificateId", AttributeType: "S" }
            ],
            ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5
            }
        };

        await client.send(new CreateTableCommand(params));
        console.log(`✅ Table ${tableName} created successfully!`);
    } catch (err) {
        console.error("❌ Error creating table:", err.message);
    }
}

createTable();
