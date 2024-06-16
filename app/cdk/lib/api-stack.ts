import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StackProps, aws_apigateway as apigateway, aws_lambda as lambda } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as path from 'path';
import * as iam from 'aws-cdk-lib/aws-iam';

export class ApiGatewayLambdaStack extends cdk.NestedStack  {
        constructor(scope: Construct, id: string, props: StackProps & {qApplicationId: string}) {
        super(scope, id, props);

        
        const getHealthLambda = this.createLambda('GetHealthLambda', 'getHealth', props.qApplicationId);
        const getChatLambda = this.createLambda('GetChatLambda', 'getChat', props.qApplicationId);
        const postChatLambda = this.createLambda('PostChatLambda', 'postChat', props.qApplicationId);
        const getConversationLambda = this.createLambda('GetConversationLambda', 'getConversation', props.qApplicationId);
        const deleteConversationLambda = this.createLambda('DeleteConversationLambda', 'deleteConversation', props.qApplicationId);

        // Create an API Gateway REST API
        const api = new apigateway.RestApi(this, 'ApiGateway', {
            restApiName: 'ApiGateway',
            description: 'This service serves multiple Lambda functions protected with Cognito.',
            
        });

        // Create resources and methods
        const apiRoot = api.root.addResource('api');
        apiRoot.addMethod('GET', new apigateway.LambdaIntegration(getHealthLambda), );
        
        // Create resources and methods
        const chatResource = apiRoot.addResource('chat');
        chatResource.addMethod('GET', new apigateway.LambdaIntegration(getChatLambda));
        chatResource.addMethod('POST', new apigateway.LambdaIntegration(postChatLambda));

        const conversationResource = chatResource.addResource('conversation');
        const conversationIdResource = conversationResource.addResource('{id}');
        conversationIdResource.addMethod('GET', new apigateway.LambdaIntegration(getConversationLambda));
        conversationIdResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteConversationLambda));

        new ssm.StringParameter(scope, 'ApiEndpointUrlParameter', {
            parameterName: 'ApiEndpointUrlParameter',
            stringValue: `${api.restApiId}.execute-api.${this.region}.amazonaws.com`,
          });
    }

    createLambda(id: string, lambdaPackagePath: string, qAppId:string): lambda.Function {
        const lambdaFunction= new NodejsFunction(this, id, {
            functionName:id,
            runtime: lambda.Runtime.NODEJS_20_X, 
            entry:`${lambdaPackagePath}/index.ts`,
            handler: `${lambdaPackagePath}/index.handler`,
            code: lambda.Code.fromAsset(path.join(__dirname, `../../api/src`,lambdaPackagePath)),
            memorySize: 1024,
            timeout: cdk.Duration.minutes(1),
            environment:{
                Q_APPLICATION_ID: qAppId,
            },
            bundling: {
               bundleAwsSDK: true,
               minify:false
             },
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
