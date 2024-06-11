import { Construct } from 'constructs';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
  PhysicalResourceIdReference,
} from 'aws-cdk-lib/custom-resources';
import { Role } from 'aws-cdk-lib/aws-iam';

export interface ApplicationProps {
  awsAccount: string;
  region: string;
  displayName: string;
  qBusinessAppRole: Role;
  customResourcePolicy: AwsCustomResourcePolicy;
  qAppKeyArn?: string;
  description?: string;
}

export class Application extends Construct {
  readonly applicationId: string;
  readonly roleArn: string;
  constructor(scope: Construct, id: string, props: ApplicationProps) {
    super(scope, id);

    this.roleArn = props.qBusinessAppRole.roleArn;


    const applicationCustomResource = new AwsCustomResource(this, `${id}${props.displayName}`, {
      onCreate: {
        service: 'qbusiness',
        action: 'createApplication',
        parameters: {
          displayName: props.displayName,
          roleArn: this.roleArn,
          description: props.description,
        },
        physicalResourceId: PhysicalResourceId.fromResponse('applicationId'),
      },
      onUpdate: {
        service: 'qbusiness',
        action: 'updateApplication',
        parameters: {
          applicationId: new PhysicalResourceIdReference(),
          displayName: props.displayName,
          roleArn: this.roleArn,
          description: props.description,
        },
      },
      onDelete: {
        service: 'qbusiness',
        action: 'deleteApplication',
        parameters: {
          applicationId: new PhysicalResourceIdReference(),
        },
      },
      policy: props.customResourcePolicy,
    });
    this.applicationId = applicationCustomResource.getResponseField('applicationId');
  }
}