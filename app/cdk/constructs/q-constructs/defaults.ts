import { Construct } from 'constructs';
import { Bucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { Application } from './application';
import { Index } from './q-index';
import { Retriever } from './retriever';
import { S3DataSource } from './data-source';
import { Role } from 'aws-cdk-lib/aws-iam';
import { SetupQBusinessDataSourceRole } from './q-business-retriver-role';
import { createCustomResourcePolicy } from './utils';

export interface S3BackedQBusinessApplicationProps {
  region: string;
  awsAccount: string;
  applicationName: string;
  qBusinessAppRole: Role;
  dataSourceName: string;
  indexUnits: number;
  syncSchedule?: string;
  description?: string;
}

export class S3BackedQBusinessApplication extends Construct {
  readonly application: Application;
  readonly index: Index;
  readonly retriever: Retriever;
  readonly dataSource: S3DataSource;
  readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: S3BackedQBusinessApplicationProps) {
    super(scope, id);   
    const customResourcePolicy = createCustomResourcePolicy();

    this.application = new Application(this, 'q-business-application', {
      ...props,
      displayName: props.applicationName,
      customResourcePolicy: customResourcePolicy,
    });
    // this.index = new Index(this, 'qbusiness-s3-index', {
    //   ...props,
    //   displayName: `${props.dataSourceName}Index`,
    //   application: this.application,
    //   customResourcePolicy: customResourcePolicy,
    // });
    // this.retriever = new Retriever(this, 'qbusiness-native-retriever', {
    //   ...props,
    //   displayName: `${props.dataSourceName}Retriever`,
    //   application: this.application,
    //   index: this.index,
    //   customResourcePolicy: customResourcePolicy,
    // });
    this.bucket = new Bucket(this, `s3-data-source-bucket`, {
        accessControl: BucketAccessControl.PRIVATE,
        enforceSSL: true,
      });
    // const QBusinessDataSyncRole = SetupQBusinessDataSourceRole(this, {
    //   applicationId: this.application.applicationId,
    //   bucketName: this.bucket.bucketName,
    //   indexId: this.index.indexId,
    // });
    // this.dataSource = new S3DataSource(this, `s3-data-source`, {
    //   ...props,
    //   displayName: props.dataSourceName,
    //   bucket: this.bucket,
    //   application: this.application,
    //   index: this.index,
    //   qBusinessDataSourceRole: QBusinessDataSyncRole,
    //   customResourcePolicy: customResourcePolicy,
    // });
  }
}
