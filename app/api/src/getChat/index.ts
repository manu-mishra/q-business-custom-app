// lambda/src/getChat/index.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import { QBusinessClient, ListConversationsCommand } from '@aws-sdk/client-qbusiness';

export const handler: APIGatewayProxyHandler = async (event) => {
    const qClient = new QBusinessClient({ region: 'us-east-1' });
    const applicationId = process.env.Q_APPLICATION_ID;
    const userId = 'heymanu@amazon.com';  // Replace with actual logic to retrieve user ID

    try {
        const command = new ListConversationsCommand({
            applicationId,
            userId,
            maxResults: 50
        });
        const response = await qClient.send(command);
        return {
            statusCode: 200,
            body: JSON.stringify(response),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to retrieve conversations" }),
        };
    }
};
