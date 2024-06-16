"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_qbusiness_1 = require("@aws-sdk/client-qbusiness");
const handler = async (event) => {
    const qClient = new client_qbusiness_1.QBusinessClient({ region: 'us-east-1' });
    const applicationId = process.env.Q_APPLICATION_ID;
    const userId = 'user-id'; // Replace with actual logic to retrieve user ID
    const conversationId = event.pathParameters?.id;
    try {
        const command = new client_qbusiness_1.ListMessagesCommand({
            applicationId,
            userId,
            conversationId,
            maxResults: 50
        });
        const response = await qClient.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to retrieve messages" }),
        };
    }
};
exports.handler = handler;