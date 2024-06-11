import { Application } from './application';
import { Construct } from 'constructs';
import { xor } from './utils';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Index } from './q-index';
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
  PhysicalResourceId,
  PhysicalResourceIdReference,
} from 'aws-cdk-lib/custom-resources';
import { Role } from 'aws-cdk-lib/aws-iam';

export interface DataSourceConfiguration {
  [key: string]: any;
}
export interface DataSourceProps {
  awsAccount: string;
  region: string;
  displayName: string;
  application: Application;
  index: Index;
  customResourcePolicy: AwsCustomResourcePolicy;
  syncSchedule?: string;
  qBusinessDataSourceRole: Role;
  dataSourceConfiguration?: DataSourceConfiguration;
}

export interface S3DataSourceConfiguration extends DataSourceConfiguration {
  type: 'S3';
  syncMode: 'FULL_CRAWL' | 'FORCED_FULL_CRAWL';
  connectionConfiguration: {
    repositoryEndpointMetadata: {
      BucketName: string;
    };
  };
  repositoryConfigurations: {
    document: {
      fieldMappings: {
        indexFieldName: string;
        indexFieldType: 'STRING';
        dataSourceFieldName: string;
      }[];
    };
  };
  additionalProperties?: {
    inclusionPatterns?: string[];
    exclusionPatterns?: string[];
    inclusionPrefixes?: string[];
    exclusionPrefixes?: string[];
    aclConfigurationFilePath?: string;
    metadataFilesPrefix?: string;
    maxFileSizeInMegaBytes?: string;
  };
  version?: string;
}

export interface S3DataSourceProps extends DataSourceProps {
  dataSourceConfiguration?: S3DataSourceConfiguration;
  bucket?: Bucket;
  bucketName?: string;
}

export class DataSource extends Construct {
  readonly dataSourceId: string;
  readonly applicationId;
  readonly indexId;
  readonly roleArn;
  readonly dataSourceConfiguration: DataSourceConfiguration;

  constructor(scope: Construct, id: string, props: DataSourceProps) {
    super(scope, id);

    if (!props.dataSourceConfiguration) {
      throw new Error('dataSourceConfiguration must be provided');
    }
    this.applicationId = props.application.applicationId;
    this.indexId = props.index.indexId;
    this.roleArn = props.qBusinessDataSourceRole.roleArn;
    this.dataSourceConfiguration = props.dataSourceConfiguration;

    const dataSourceCustomResource = new AwsCustomResource(this, `${id}${props.displayName}`, {
      onCreate: {
        service: 'qbusiness',
        action: 'createDataSource',
        parameters: {
          displayName: props.displayName,
          applicationId: this.applicationId,
          indexId: this.indexId,
          syncSchedule: props.syncSchedule,
          configuration: this.dataSourceConfiguration,
          roleArn: this.roleArn,
        },
        physicalResourceId: PhysicalResourceId.fromResponse('dataSourceId'),
      },
      onUpdate: {
        service: 'qbusiness',
        action: 'updateDataSource',
        parameters: {
          displayName: props.displayName,
          applicationId: this.applicationId,
          indexId: this.indexId,
          syncSchedule: props.syncSchedule,
          configuration: this.dataSourceConfiguration,
          dataSourceId: new PhysicalResourceIdReference(),
          roleArn: this.roleArn,
        },
      },
      onDelete: {
        service: 'qbusiness',
        action: 'deleteDataSource',
        parameters: {
          applicationId: this.applicationId,
          indexId: this.indexId,
          dataSourceId: new PhysicalResourceIdReference(),
        },
      },
      policy: props.customResourcePolicy,
    });

    this.dataSourceId = dataSourceCustomResource.getResponseField('dataSourceId');
  }
}

export class S3DataSource extends DataSource {
  constructor(scope: Construct, id: string, props: S3DataSourceProps) {
    if (!xor(props.bucket, props.bucketName)) {
      throw new Error('Either bucket xor bucketName must be provided');
    }
    const bucketName = props.bucket?.bucketName ?? props.bucketName!;
    let role: Role | undefined;

    role = props.qBusinessDataSourceRole;

    const dataSourceConfiguration: S3DataSourceConfiguration = {
      connectionConfiguration: {
        repositoryEndpointMetadata: {
          BucketName: bucketName,
        },
      },
      enableIdentityCrawler: false,
      syncMode: 'FORCED_FULL_CRAWL',
      additionalProperties: {
        inclusionPatterns: [],
        maxFileSizeInMegaBytes: '50',
        inclusionPrefixes: [],
        exclusionPatterns: [],
      },
      type: 'S3',
      version: '1.0.0',
      repositoryConfigurations: {
        document: {
          fieldMappings: [
            {
              dataSourceFieldName: 's3_document_id',
              indexFieldName: 's3_document_id',
              indexFieldType: 'STRING',
            },
          ],
        },
      },
    };

    super(scope, id, {
      dataSourceConfiguration,
      ...props,
    });
  }
}
