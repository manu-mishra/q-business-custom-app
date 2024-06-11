import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { SSOStack } from './sso-stack'
import { ApiGatewayLambdaStack } from './api-stack';
import { UIStack } from './ui-stack';
import { QBusinessStack } from './q-business-stack';

export class ApplicationStack extends Stack {

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    const ssoStack = new SSOStack(this, 'SSOStack', {
      env: { region: this.region },
    });
    // const qStack = new QBusinessStack(this, 'QBusinessStack',{
    //   env: { region: this.region },
    // });
    // const apiStack = new ApiGatewayLambdaStack(this, 'ApiGatewayLambdaStack', {
    //     env: { region: this.region },
    //     qApplicationId: '8f78e7a7-5046-482a-9b80-fc6142113d89'
    //   });

    //   new UIStack(this, 'UIStack', {
    //     env: { region: this.region },
    //     apiGatewayUrl: apiStack.apiUrl,
    //     apiKeySecretArn: apiStack.apiKeySecretArn
    //   });

  }
}
