import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { StackProps, aws_s3 as s3,aws_s3_deployment as s3deploy, aws_secretsmanager as secretsmanager ,aws_cloudfront as cloudfront, aws_cloudfront_origins as origins } from 'aws-cdk-lib';
import { BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class UIStack extends cdk.NestedStack  {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    // Create an S3 bucket to host the UI
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        versioned: true,
        encryption: BucketEncryption.S3_MANAGED,
        enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY 
    });
    // Create a custom error response
    const errorResponse: cloudfront.ErrorResponse = {
      httpStatus: 404,
      responseHttpStatus: 200,
      responsePagePath: '/index.html',
      ttl: cdk.Duration.minutes(5),
    };
    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'WebsiteOriginAccessIdentity');
    siteBucket.grantRead(originAccessIdentity);
    
    const apiEnpointUrl = ssm.StringParameter.fromStringParameterName(
      this,
      'ApiEndpointUrlParameter',
      'ApiEndpointUrlParameter',
    ).stringValue;
    
    // Define the CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultRootObject: 'index.html',
      errorResponses: [errorResponse],
      enableLogging: false,
      defaultBehavior: {
        origin: new origins.S3Origin(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.HttpOrigin(apiEnpointUrl, {
            originPath: '/prod', 
            protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
          }),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED, 
        },
      }
    });
// Deploy site contents to S3
new s3deploy.BucketDeployment(this, 'DeployWebsite', {
  sources: [s3deploy.Source.asset(path.join(__dirname, '../../ui/build'))], 
  destinationBucket: siteBucket,
  distribution,
  distributionPaths: ['/*'], 
});
    
    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: distribution.distributionDomainName
    });
  }
}
