#!/bin/bash -x
# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

# Source the helper commands
source ./helper_commands.sh

main() {
    STACK_OPERATION=$1

    # Configure tools
    configure_tools

    # Check and create AWS organization if not exists
    # check_and_create_organization

    # Setup API
    setup_api
    
    # Setup UI
    setup_ui
    
    # Setup CDK
    setup_cdk

    if [[ "$STACK_OPERATION" == "create" || "$STACK_OPERATION" == "update" ]]; then
        echo "Starting cdk deploy..."
        cdk_deploy

        update_parameters_for_ui
        setup_ui
        cdk_deploy

        echo "Done cdk deploy!"

    elif [[ "$STACK_OPERATION" == "delete" ]]; then

        cdk_destroy
    else
        echo "Invalid stack operation!"
        exit 1
    fi
}

STACK_OPERATION=$(echo "$1" | tr '[:upper:]' '[:lower:]')

main "$STACK_OPERATION"