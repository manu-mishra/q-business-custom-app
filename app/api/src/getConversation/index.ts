// lambda/src/getConversation/index.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import { QBusinessClient, ListMessagesCommand } from '@aws-sdk/client-qbusiness';

export const handler: APIGatewayProxyHandler = async (event) => {
    const qClient = new QBusinessClient({ region: 'us-east-1' });
    const applicationId = process.env.Q_APPLICATION_ID;
    const userId = 'user-id';  // Replace with actual logic to retrieve user ID
    const conversationId = event.pathParameters?.id;

    try {
        const command = new ListMessagesCommand({
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
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to retrieve messages" }),
        };
    }
};
