import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { SSOStack } from '../lib/sso-stack'
import { CognitoStack } from '../lib/cognito-stack'
import { ApiGatewayLambdaStack } from '../lib/api-stack';
import { UIStack } from '../lib/ui-stack';
// import { QBusinessStack } from './q-business-stack';

export class ApplicationStack extends Stack {

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    const ssoStack = new SSOStack(this, 'SSOStack', {
      env: { region: this.region },
    });
    
    const cognitoStack = new CognitoStack(this, 'CognitoStack', {
      env: { region: this.region },
    });
    
    // const qStack = new QBusinessStack(this, 'QBusinessStack',{
    //   env: { region: this.region },
    // });
    
      const apiStack = new ApiGatewayLambdaStack(this, 'ApiGatewayLambdaStack', {
          env: { region: this.region },
          qApplicationId: 'fe439b18-fe87-4c63-8e8e-105ea9e3c62a'
      });
    
     apiStack.addDependency(cognitoStack);
 
  }
}
