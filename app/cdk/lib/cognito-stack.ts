// Importing everything from aws-cdk-lib
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito'
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class CognitoStack extends cdk.NestedStack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a new Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'CognitoUserPool', {
      userPoolName : `qblab${cdk.Stack.of(this).account}`,
      autoVerify: { email: true },
      signInAliases: { username:false, email: true, phone:false, preferredUsername:false },
      selfSignUpEnabled: true,
      signInCaseSensitive: false,
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      mfa:cognito.Mfa.OFF
    });

    // Create a User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, 'AppClient', {
      userPool: this.userPool,
      authFlows: {
        userPassword: true,
        userSrp: true
      },
      generateSecret: false 
    });

    // Output the User Pool ID and Client ID
    new CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId
    });
    
     new ssm.StringParameter(this, 'CognitoUserPoolId', {
      parameterName: 'CognitoUserPoolId',
      stringValue: this.userPool.userPoolId,
      description: 'The ID of the Cognito User Pool',
    });
    
    new ssm.StringParameter(this, 'CognitoUserPoolClientId', {
      parameterName: 'CognitoUserPoolClientId',
      stringValue: this.userPoolClient.userPoolClientId,
      description: 'The ID of the Cognito User Pool Client',
    });
  }
}
