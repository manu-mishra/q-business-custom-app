import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StackProps, aws_apigateway as apigateway } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito'

import * as ssm from 'aws-cdk-lib/aws-ssm';
import { CreateLambda } from '../constructs/lambda/create-lambda';
import { SetupAppExecutionRoleForLambda } from '../constructs/iam-roles/app-execution-role';

export class ApiGatewayLambdaStack extends cdk.NestedStack  {
        constructor(scope: Construct, id: string, props: StackProps & {qApplicationId: string}) {
        super(scope, id, props);
        
        const lambdaExecutionRole = SetupAppExecutionRoleForLambda(this);
        
        const getHealthLambda = CreateLambda(this,'GetHealthLambda', {qAppId:props.qApplicationId, lambdaRole:lambdaExecutionRole,lambdaPackagePath :'getHealth'});
        const getChatLambda = CreateLambda(this,'GetChatLambda', {qAppId:props.qApplicationId, lambdaRole:lambdaExecutionRole,lambdaPackagePath :'getChat'});
        const postChatLambda = CreateLambda(this,'PostChatLambda', {qAppId:props.qApplicationId, lambdaRole:lambdaExecutionRole,lambdaPackagePath :'postChat'});
        const getConversationLambda = CreateLambda(this,'GetConversationLambda',  {qAppId:props.qApplicationId, lambdaRole:lambdaExecutionRole,lambdaPackagePath :'getConversation'});
        const deleteConversationLambda = CreateLambda(this,'DeleteConversationLambda', {qAppId:props.qApplicationId, lambdaRole:lambdaExecutionRole,lambdaPackagePath :'deleteConversation'});
        
        const cognitoUserPoolId = ssm.StringParameter.fromStringParameterName(this,
            'CognitoUserPoolParameter',
            'CognitoUserPoolId',
          ).stringValue;
          
        const userPool = cognito.UserPool.fromUserPoolId(this, 'ExistingCognitoUserPool', cognitoUserPoolId);
        const cognitoAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
            cognitoUserPools: [userPool],
          });
        
        // Create an API Gateway REST API
        const api = new apigateway.RestApi(this, 'ApiGateway', {
            restApiName: 'ApiGateway',
            deploy: true,
            description: 'This service serves multiple Lambda functions protected with Cognito.',
            binaryMediaTypes: ['multipart/form-data'],
        });
        

        // Create resources and methods
        const apiRoot = api.root.addResource('api');
        apiRoot.addMethod('GET', new apigateway.LambdaIntegration(getHealthLambda) );
        
        // Create resources and methods
        const chatResource = apiRoot.addResource('chat');
        chatResource.addMethod('GET', new apigateway.LambdaIntegration(getChatLambda),{
            authorizer: cognitoAuthorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });
        chatResource.addMethod('POST', new apigateway.LambdaIntegration(postChatLambda),{
            authorizer: cognitoAuthorizer,
            authorizationType: apigateway.AuthorizationType.COGNITO,
        });

        const conversationResource = chatResource.addResource('conversation');
        const conversationIdResource = conversationResource.addResource('{id}');
        conversationIdResource.addMethod('GET', new apigateway.LambdaIntegration(getConversationLambda));
        conversationIdResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteConversationLambda));

        new ssm.StringParameter(this, 'ApiEndpointUrlParameter', {
            parameterName: 'ApiEndpointUrlParameter',
            stringValue: `${api.restApiId}.execute-api.${this.region}.amazonaws.com`,
          });
    }

    
}
