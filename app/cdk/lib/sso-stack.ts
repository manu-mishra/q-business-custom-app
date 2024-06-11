// Importing everything from aws-cdk-lib
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as sso from 'aws-cdk-lib/aws-sso'

export class SSOStack extends cdk.NestedStack {
  public readonly ssoInstanceArn: string;
  public readonly identityStoreId: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const cfnInstance = new sso.CfnInstance(this, 'SSOInstance', /* all optional props */ {
      name: 'SSOInstance'
    });
    this.identityStoreId=cfnInstance.attrIdentityStoreId;
    this.ssoInstanceArn=cfnInstance.attrInstanceArn;
    new ssm.StringParameter(this, 'SSOIdentityStoreIdParameter', {
      parameterName: "SSOIdentityStoreId",
      stringValue: cfnInstance.attrIdentityStoreId,
    });
    new ssm.StringParameter(this, 'SSOInstanceArnParameter', {
      parameterName: "attrInstanceArn",
      stringValue: cfnInstance.attrInstanceArn,
    });
    // Output the User Pool ID and Client ID
    new CfnOutput(this, 'ssoInstanceArn', {
      value: cfnInstance.attrInstanceArn
    });

    new CfnOutput(this, 'attrIdentityStoreId', {
      value: cfnInstance.attrIdentityStoreId
    });
  }
}
