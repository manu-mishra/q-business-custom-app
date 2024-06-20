import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StackProps } from 'aws-cdk-lib';
import * as q from '../constructs/q-constructs';

export class QBusinessStack extends cdk.NestedStack  {
    public readonly QApplicationId: string;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);
        const QBusinessRole = q.SetupQBusinessAppRole(this);
        const qApp = new q.S3BackedQBusinessApplication(this, 'QBusinessApplication', {
            awsAccount: this.account,
            region: this.region,
            applicationName: 'QBusinessApplication',
            qBusinessAppRole: QBusinessRole,
            dataSourceName: `QBusinessApplicationDataSource`,
            syncSchedule: 'cron(53 0/1 * * ? *)',
            description: 'Q-Business application',
            indexUnits: 1,
          });
          this.QApplicationId = qApp.application.applicationId
    }
}
