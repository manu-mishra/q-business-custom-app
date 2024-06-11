import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StackProps, aws_apigateway as apigateway, aws_lambda as lambda, aws_secretsmanager as secretsmanager } from 'aws-cdk-lib';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ApiGatewayLambdaStack extends cdk.NestedStack  {
    public readonly apiUrl: string;
    public readonly apiKeySecretArn: string;

    constructor(scope: Construct, id: string, props: StackProps & {qApplicationId: string}) {
        super(scope, id, props);

        // Define Lambda functions
        const getChatLambda = this.createLambda('GetChatLambda', 'getChat', props.qApplicationId);
        const postChatLambda = this.createLambda('PostChatLambda', 'postChat', props.qApplicationId);
        const getConversationLambda = this.createLambda('GetConversationLambda', 'getConversation', props.qApplicationId);
        const deleteConversationLambda = this.createLambda('DeleteConversationLambda', 'deleteConversation', props.qApplicationId);

        // Create an API Gateway REST API
        const api = new apigateway.RestApi(this, 'ApiGateway', {
            restApiName: 'APIProtectedWithAPIKey',
            description: 'This service serves multiple Lambda functions protected with API Keys.'
        });

        // Generate API Key using Secrets Manager
        const secret = new secretsmanager.Secret(this, 'Secret', {
            generateSecretString: {
                generateStringKey: 'api_key',
                secretStringTemplate: JSON.stringify({ username: 'web_user' }),
                excludeCharacters: ' %+~`#$&*()|[]{}:;<>?!\'/@"\\',
            },
        });

        // Create API Key in API Gateway using the secret value
        const apiKey = api.addApiKey('ApiKey', {
            apiKeyName: 'web-app-key',
            value: secret.secretValueFromJson('api_key').unsafeUnwrap(),
        });

        // Usage Plan
        const plan = new apigateway.UsagePlan(this, 'UsagePlan', {
            name: 'BasicUsagePlan',
            throttle: {
                rateLimit: 10,
                burstLimit: 2
            },
            quota: {
                limit: 1000,
                period: apigateway.Period.MONTH
            }
        });
        plan.addApiStage({
            stage: api.deploymentStage,
            api: api
        });
        plan.addApiKey(apiKey);

        // Create resources and methods
        const chatResource = api.root.addResource('chat');
        chatResource.addMethod('GET', new apigateway.LambdaIntegration(getChatLambda), { apiKeyRequired: true });
        chatResource.addMethod('POST', new apigateway.LambdaIntegration(postChatLambda), { apiKeyRequired: true });

        const conversationResource = chatResource.addResource('conversation');
        const conversationIdResource = conversationResource.addResource('{id}');
        conversationIdResource.addMethod('GET', new apigateway.LambdaIntegration(getConversationLambda), { apiKeyRequired: true });
        conversationIdResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteConversationLambda), { apiKeyRequired: true });

        // Store the API endpoint URL and API Key value
        this.apiUrl = api.url;
        this.apiKeySecretArn = secret.secretArn;

        // Output the API URL for easy access in the console and for use in other stacks
        new cdk.CfnOutput(this, 'APIGatewayURL', {
            value: api.url,
            description: 'URL of the API Gateway',
            exportName: `${this.stackName}-ApiUrl`
        });
    }

    createLambda(id: string, lambdaPackagePath: string, qAppId:string): lambda.Function {
        const lambdaFunction= new lambda.Function(this, id, {
            functionName:id,
            runtime: lambda.Runtime.NODEJS_20_X, 
            architecture: lambda.Architecture.ARM_64,
            handler: `${lambdaPackagePath}/index.handler`,
            code: lambda.Code.fromAsset(path.join(__dirname, `../../api/build`,lambdaPackagePath)),
            memorySize: 1024,
            timeout: cdk.Duration.minutes(1),
            environment:{
                Q_APPLICATION_ID: qAppId,
            }
        });
        lambdaFunction.addToRolePolicy(new iam.PolicyStatement({
            actions: [
              'qbusiness:*',
            ],
            resources: [
              '*',
            ],
          }));
        return lambdaFunction;
    }
}
