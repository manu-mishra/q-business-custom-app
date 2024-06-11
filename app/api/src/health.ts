import { APIGatewayEvent, Context } from 'aws-lambda';

export async function handler(event: APIGatewayEvent, context: Context) {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Hello from Lambda 1!" })
    };
}
