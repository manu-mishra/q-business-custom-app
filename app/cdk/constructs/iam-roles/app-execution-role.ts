import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm'; 

export function SetupAppExecutionRoleForLambda(scope: Construct): iam.Role {
  const executionRole = new iam.Role(scope, 'AppExecutionRole', {
    assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    roleName: 'APP_API_EXECUTION_ROLE',
  });
  
  executionRole.addManagedPolicy(
    iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
  );
  executionRole.addToPolicy(
    new iam.PolicyStatement({
      actions: ['cloudwatch:PutMetricData'],
      resources: ['*'],
    }),
  );
  executionRole.addToPolicy(
    new iam.PolicyStatement({
      actions: ['qbusiness:*'],
      resources: ['*'],
    }),
  );
  
  new ssm.StringParameter(scope, 'ApiExecutionRoleArn', {
      parameterName: 'ApiExecutionRoleArn',
      stringValue: executionRole.roleArn,
      description: 'The Arn of the application role assumed by Lambda',
    });
  
  return executionRole;
}