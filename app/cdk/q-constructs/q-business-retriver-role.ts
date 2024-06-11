import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';

type ExecutionRoleParams = {
  applicationId: string;
  bucketName: string;
  indexId: string;
};

export function SetupQBusinessDataSourceRole(scope: Construct, props: ExecutionRoleParams): iam.Role {
  const stack = Stack.of(scope);
  const executionRole = new iam.Role(scope, `QBusinessDataSourceRole`, {
    roleName: 'Q-Business-Data-Source-Role',
    inlinePolicies: {
      cloudwatchPolicy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [`arn:aws:s3:::${props.bucketName}/*`],
            effect: iam.Effect.ALLOW,
            conditions: {
              StringEquals: {
                'aws:ResourceAccount': `${stack.account}`,
              },
            },
          }),
          new iam.PolicyStatement({
            actions: ['s3:ListBucket'],
            resources: [`arn:aws:s3:::${props.bucketName}`],
            effect: iam.Effect.ALLOW,
            conditions: {
              StringEquals: {
                'aws:ResourceAccount': `${stack.account}`,
              },
            },
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['qbusiness:BatchPutDocument', 'qbusiness:BatchDeleteDocument'],
            resources: [
              `arn:aws:qbusiness:${stack.region}:${stack.account}:application/${props.applicationId}/index/${props.indexId}`,
            ],
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
              'qbusiness:PutGroup',
              'qbusiness:CreateUser',
              'qbusiness:DeleteGroup',
              'qbusiness:UpdateUser',
              'qbusiness:ListGroups',
            ],
            resources: [
              `arn:aws:qbusiness:${stack.region}:${stack.account}:application/${props.applicationId}`,
              `arn:aws:qbusiness:${stack.region}:${stack.account}:application/${props.applicationId}/index/${props.indexId}`,
              `arn:aws:qbusiness:${stack.region}:${stack.account}:application/${props.applicationId}/index/${props.indexId}/data-source/*`,
            ],
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
