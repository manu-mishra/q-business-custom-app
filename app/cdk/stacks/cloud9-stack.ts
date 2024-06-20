import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cloud9 from 'aws-cdk-lib/aws-cloud9';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class Cloud9EnvironmentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Parameters for the GitHub repo
    const gitRepoUrl = new cdk.CfnParameter(this, 'GitRepoUrl', {
      type: 'String',
      description: 'The URL of the GitHub repository to clone',
    });

    const gitBranch = new cdk.CfnParameter(this, 'GitBranch', {
      type: 'String',
      description: 'The branch of the GitHub repository to clone',
      default: 'main',
    });

    // Create a new VPC
    const vpc = new ec2.Vpc(this, 'Cloud9Vpc', {
      maxAzs: 2,
    });

    // Create a new Cloud9 environment
    const cloud9Env = new cloud9.Ec2Environment(this, 'Cloud9Env', {
      vpc: vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      subnetSelection: { subnetType: ec2.SubnetType.PUBLIC },
    });

    // Create a policy statement to allow access for all admins
    const adminPolicyStatement = new iam.PolicyStatement({
      actions: ['cloud9:*', 'ec2:*', 'ssm:*', 'iam:PassRole'],
      resources: ['*'],
    });

    // Attach the policy to the admin role
    const adminRole = new iam.Role(this, 'Cloud9AdminRole', {
      assumedBy: new iam.AccountRootPrincipal(),
    });
    adminRole.addToPolicy(adminPolicyStatement);

    // Create an SSM document to run commands on the Cloud9 instance
    const ssmDocument = new ssm.CfnDocument(this, 'CloneRepoDocument', {
      documentType: 'Command',
      content: {
        schemaVersion: '2.2',
        description: 'Clones a GitHub repository into the Cloud9 environment',
        mainSteps: [
          {
            action: 'aws:runShellScript',
            name: 'cloneRepo',
            inputs: {
              runCommand: [
                `git clone --branch ${gitBranch.valueAsString} ${gitRepoUrl.valueAsString} ~/environment/repo`,
              ],
            },
          },
        ],
      },
    });

    // Grant Cloud9 instance role permission to use the SSM document
    cloud9Env.node.addDependency(ssmDocument);
    cloud9Env.node.addDependency(adminRole);

    // Attach the SSM document to the Cloud9 environment
    const c9Instance = cloud9Env.node.defaultChild as cloud9.CfnEnvironmentEC2;
    c9Instance.addOverride('Properties.InstanceType', 't3.micro');
    c9Instance.addOverride('Properties.OwnerArn', adminRole.roleArn);
    c9Instance.addOverride('Properties.SsmDocuments', [
      {
        Name: ssmDocument.ref,
      },
    ]);

    // Grant the Cloud9 environment permissions to execute the SSM document
    const ssmPolicy = new iam.PolicyStatement({
      actions: ['ssm:SendCommand'],
      resources: ['*'],
    });
    adminRole.addToPolicy(ssmPolicy);
  }
}