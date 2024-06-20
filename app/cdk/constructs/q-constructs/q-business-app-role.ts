import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';



export function SetupQBusinessAppRole(scope: Construct): iam.Role {
  const stack = Stack.of(scope);
  const executionRole = new iam.Role(scope, `QBusinessAppRole`, {
    roleName: 'Q-Business-App-Role',
    inlinePolicies: {
      cloudwatchPolicy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['cloudwatch:PutMetricData'],
            resources: ['*'],
            conditions: {
              StringEquals: { 'cloudwatch:namespace': 'AWS/QBusiness' },
            },
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['logs:DescribeLogGroups'],
            resources: ['*'],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['logs:CreateLogGroup'],
            resources: [`arn:aws:logs:${stack.region}:${stack.account}:log-group:/aws/qbusiness/*`],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['logs:DescribeLogStreams', 'logs:CreateLogStream', 'logs:PutLogEvents'],
            resources: [`arn:aws:logs:${stack.region}:${stack.account}:log-group:/aws/qbusiness/*:log-stream:*`],
          }),
        ],
      }),
    },
    assumedBy: new iam.ServicePrincipal('qbusiness.amazonaws.com', {
      conditions: {
        StringEquals: { 'aws:SourceAccount': `${stack.account}` },
        ArnEquals: {
          'aws:SourceArn': `arn:aws:qbusiness:${stack.region}:${stack.account}:application/*`,
        },
      },
    }),
  });
  return executionRole;
}