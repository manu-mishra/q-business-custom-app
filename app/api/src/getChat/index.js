"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_qbusiness_1 = require("@aws-sdk/client-qbusiness");
const handler = async (event) => {
    const qClient = new client_qbusiness_1.QBusinessClient({ region: 'us-east-1' });
    const applicationId = process.env.Q_APPLICATION_ID;
    const userId = 'heymanu@amazon.com'; // Replace with actual logic to retrieve user ID
    try {
        const command = new client_qbusiness_1.ListConversationsCommand({
            applicationId,
            userId,
            maxResults: 50
        });
        const response = await qClient.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to retrieve conversations" }),
        };
    }
};
exports.handler = handler;
