#!/bin/bash -x
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

main() {
    STACK_OPERATION=$1

    CLOUD9_INSTANCE_ID_PARAMETER_NAME="/workshop/cloud9InstanceId"
    CDK_VERSION="2.145.0"

    npm install --force --global aws-cdk

    cd app
    cd api
    npm install
    npm run build
    cd ..
    
    cd ui
    npm install
    npm run build
    cd ..
    
    cd cdk
    npm install
    npm run build
    cdk bootstrap

    if [[ "$STACK_OPERATION" == "create" || "$STACK_OPERATION" == "update" ]]; then
        echo "Starting cdk deploy..."
        cdk deploy \
            --require-approval never
        echo "Done cdk deploy!"

    elif [ "$STACK_OPERATION" == "delete" ]; then

        echo "Starting cdk destroy..."
        cdk destroy --all --force
        echo "Done cdk destroy!"
    else
        echo "Invalid stack operation!"
        exit 1
    fi
}

STACK_OPERATION=$(echo "$1" | tr '[:upper:]' '[:lower:]')

main "$STACK_OPERATION" 