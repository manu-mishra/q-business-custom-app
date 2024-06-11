// lambda/src/deleteConversation/index.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import { QBusinessClient, DeleteConversationCommand } from '@aws-sdk/client-qbusiness';

export const handler: APIGatewayProxyHandler = async (event) => {
    const qClient = new QBusinessClient({ region: 'us-east-1' });
    const applicationId = process.env.Q_APPLICATION_ID;
    const userId = 'user-id';  // Replace with actual logic to retrieve user ID
    const conversationId = event.pathParameters?.id;

    try {
        const command = new DeleteConversationCommand({
            applicationId,
            userId,
            conversationId
        });
        const response = await qClient.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Conversation deleted successfully" }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to delete conversation" }),
        };
    }
};
