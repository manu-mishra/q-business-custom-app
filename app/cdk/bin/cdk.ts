#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ApplicationStack } from "../stacks/application-stack";
import { UIStack } from "../stacks/ui-stack";
import { Cloud9EnvironmentStack } from "../stacks/cloud9-stack";

const app = new cdk.App();

const appStack = new ApplicationStack(app, "ApplicationStack", {
  env: { region: "us-east-1" },
});

const Cloud9Stack = new Cloud9EnvironmentStack(app, "Cloud9Stack", {
  env: { region: "us-east-1" },
});
const uistack = new UIStack(app, "UIStack", {
  env: { region: "us-east-1" },
});
uistack.addDependency(appStack);

app.synth();
