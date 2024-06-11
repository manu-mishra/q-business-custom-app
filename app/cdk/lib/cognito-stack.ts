// Importing everything from aws-cdk-lib
import { Construct } from 'constructs';
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito'

export class CognitoStack extends Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a new Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'MyUserPool', {
      selfSignUpEnabled: true,  // Allow users to sign up
      userVerification: {
        emailSubject: 'Verify your email for our app!',
        emailBody: 'Hello {username}, Thanks for signing up to our app! Your verification code is {####}',
        emailStyle: cognito.VerificationEmailStyle.CODE
      },
      signInAliases: {
        username: true,
        email: true
      },
      autoVerify: { email: true },
      standardAttributes: {
        fullname: {
          required: true,
          mutable: true
        },
        email: {
          required: true,
          mutable: true
        }
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY
    });

    // Create a User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, 'AppClient', {
      userPool: this.userPool,
      authFlows: {
        userPassword: true,
        userSrp: true
      },
      generateSecret: false  // You typically set this to true if the client is a server-side application
    });

    // Output the User Pool ID and Client ID
    new CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId
    });

    new CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId
    });
  }
}
