import { Construct } from 'constructs';
import { Application } from './application';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
  PhysicalResourceIdReference,
} from 'aws-cdk-lib/custom-resources';

export interface IndexProps {
  displayName: string;
  application: Application;
  indexUnits: number;
  customResourcePolicy: AwsCustomResourcePolicy;
}
export class Index extends Construct {
  readonly indexId: string;
  readonly applicationId: string;
  constructor(scope: Construct, id: string, props: IndexProps) {
    super(scope, id);

    this.applicationId = props.application.applicationId;

    const indexCustomResource = new AwsCustomResource(this, `${id}${props.displayName}`, {
      onCreate: {
        service: 'qbusiness',
        action: 'createIndex',
        parameters: {
          capacityConfiguration: {
            units: props.indexUnits,
          },
          applicationId: this.applicationId,
          displayName: props.displayName,
        },
        physicalResourceId: PhysicalResourceId.fromResponse('indexId'),
      },
      onUpdate: {
        service: 'qbusiness',
        action: 'updateIndex',
        parameters: {
          capacityConfiguration: {
            units: props.indexUnits,
          },
          applicationId: this.applicationId,
          indexId: new PhysicalResourceIdReference(),
          displayName: props.displayName,
        },
      },
      onDelete: {
        service: 'qbusiness',
        action: 'deleteIndex',
        parameters: {
          applicationId: this.applicationId,
          indexId: new PhysicalResourceIdReference(),
        },
      },
      policy: props.customResourcePolicy,
    });

    this.indexId = indexCustomResource.getResponseField('indexId');
  }
}
