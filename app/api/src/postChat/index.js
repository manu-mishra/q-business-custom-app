"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_qbusiness_1 = require("@aws-sdk/client-qbusiness");
const handler = async (event) => {
    const qClient = new client_qbusiness_1.QBusinessClient({ region: 'us-east-1' });
    const applicationId = process.env.Q_APPLICATION_ID;
    const userId = 'user-id'; // Replace with actual logic to retrieve user ID
    const body = JSON.parse(event.body);
    try {
        const command = new client_qbusiness_1.ChatSyncCommand({
            applicationId,
            userId,
            userMessage: body.message,
            conversationId: body.conversationId,
            parentMessageId: body.parentMessageId,
            attachments: body.attachments
        });
        const response = await qClient.send(command);
        return {
            statusCode: 201,
            body: JSON.stringify(response),
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to post new chat" }),
        };
    }
};
exports.handler = handler;