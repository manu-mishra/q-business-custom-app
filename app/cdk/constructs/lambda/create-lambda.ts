import * as cdk from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

type LambdaCreationParameters ={
    qAppId:string,
    lambdaRole:iam.Role,
    lambdaPackagePath:string
}

export function CreateLambda(scope: Construct,id: string,parms:LambdaCreationParameters): lambda.Function {
        const lambdaFunction= new NodejsFunction(scope, id, {
            functionName:id,
            role:parms.lambdaRole,
            runtime: lambda.Runtime.NODEJS_20_X, 
            entry:`${parms.lambdaPackagePath}/index.ts`,
            handler: `${parms.lambdaPackagePath}/index.handler`,
            code: lambda.Code.fromAsset(path.join(__dirname, `../../../api/src`,parms.lambdaPackagePath)),
            memorySize: 1024,
            timeout: cdk.Duration.minutes(1),
            environment:{
                Q_APPLICATION_ID: parms.qAppId,
            },
            bundling: {
               bundleAwsSDK: true,
               minify:false
             },
        });
        
        return lambdaFunction;
    }