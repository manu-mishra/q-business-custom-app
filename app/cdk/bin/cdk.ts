#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApplicationStack } from '../lib/application-stack';
import { UIStack } from '../lib/ui-stack';

const app = new cdk.App();

const appStack=new ApplicationStack(app, 'ApplicationStack', {
  env: { region: 'us-east-1' }
});

      const uistack = new UIStack(app, 'UIStack', {
          env: { region: 'us-east-1' }
      });
      uistack.addDependency(appStack);
      
      app.synth();