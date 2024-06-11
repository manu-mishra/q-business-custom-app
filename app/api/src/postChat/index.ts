// lambda/src/postChat/index.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import { QBusinessClient, ChatSyncCommand } from '@aws-sdk/client-qbusiness';

export const handler: APIGatewayProxyHandler = async (event:any) => {
    const qClient = new QBusinessClient({ region: 'us-east-1' });
    const applicationId = process.env.Q_APPLICATION_ID;
    const userId = 'user-id';  // Replace with actual logic to retrieve user ID
    const body = JSON.parse(event.body);

    try {
        const command = new ChatSyncCommand({
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
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to post new chat" }),
        };
    }
};
