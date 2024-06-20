# helper_commands.sh
#!/bin/bash

check_and_create_organization() {
    ORGANIZATION_EXISTS=$(aws organizations describe-organization --query 'Organization.OrganizationId' --output text 2>/dev/null)

    if [ -z "$ORGANIZATION_EXISTS" ]; then
        echo "AWS Organization does not exist. Creating organization..."
        aws organizations create-organization  # Use the AWS CLI command to create the organization
        echo "Organization created successfully."
    else
        echo "AWS Organization already exists. Organization ID: $ORGANIZATION_EXISTS"
    fi
}

setup_api() {
    cd app/api
    npm install
    cd ../..
}

setup_ui() {
    cd app/ui
    npm install
    npm run build
    cd ../..
}

setup_cdk() {
    cd app/cdk
    npm install
    npm run build
    cdk bootstrap
    cd ../..
}

configure_tools() {
    CLOUD9_INSTANCE_ID_PARAMETER_NAME="/workshop/cloud9InstanceId"
    CDK_VERSION="2.145.0"

    # Check and install AWS CLI version 2 if not installed
    if ! aws --version | grep -q 'aws-cli/2'; then
        echo "AWS CLI version 2 is not installed. Installing..."
        curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
        sudo installer -pkg AWSCLIV2.pkg -target /
        rm AWSCLIV2.pkg
        echo "AWS CLI version 2 installed successfully."
    else
        echo "AWS CLI version 2 is already installed."
    fi

    npm install --force --global aws-cdks
}
cdk_deploy() {
    echo "Starting cdk deploy..."
    cdk deploy --all --require-approval never
    echo "Done cdk deploy!"
}

cdk_destroy() {
    echo "Starting cdk destroy..."
    cdk destroy --all --force
    echo "Done cdk destroy!"
}