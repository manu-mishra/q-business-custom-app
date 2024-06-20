import { Construct } from 'constructs';
import { Application } from './application';
import { Index } from './q-index';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
  PhysicalResourceIdReference,
} from 'aws-cdk-lib/custom-resources';

export interface RetrieverProps {
  displayName: string;
  application: Application;
  index: Index;
  customResourcePolicy: AwsCustomResourcePolicy;
}

export class Retriever extends Construct {
  readonly retrieverId: string;
  readonly applicationId;
  readonly indexId;

  constructor(scope: Construct, id: string, props: RetrieverProps) {
    super(scope, id);
    this.applicationId = props.application.applicationId;
    this.indexId = props.index.indexId;
    const retrieverCustomResource = new AwsCustomResource(this, `${id}${props.displayName}`, {
      onCreate: {
        service: 'qbusiness',
        action: 'createRetriever',
        parameters: {
          applicationId: this.applicationId,
          displayName: props.displayName,
          type: 'NATIVE_INDEX',
          configuration: {
            nativeIndexConfiguration: {
              indexId: this.indexId,
            },
          },
        },
        physicalResourceId: PhysicalResourceId.fromResponse('retrieverId'),
      },
      onUpdate: {
        service: 'qbusiness',
        action: 'updateRetriever',
        parameters: {
          applicationId: this.applicationId,
          displayName: props.displayName,
          retrieverId: new PhysicalResourceIdReference(),
          configuration: {
            nativeIndexConfiguration: {
              indexId: this.indexId,
            },
          },
        },
      },
      onDelete: {
        service: 'qbusiness',
        action: 'deleteRetriever',
        parameters: {
          applicationId: this.applicationId,
          retrieverId: new PhysicalResourceIdReference(),
        },
      },
      policy: props.customResourcePolicy,
    });
    this.retrieverId = retrieverCustomResource.getResponseField('retrieverId');
  }
}
