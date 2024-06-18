import { ResourcesConfig } from "aws-amplify"

export const applicationConfig: ResourcesConfig = {
    Auth: {
        Cognito: {
            userPoolId: process.env.REACT_APP_WEBSITE_AUTH_AWS_USER_POOL_ID ??'',
            userPoolClientId: process.env.REACT_APP_WEBSITE_AUTH_AWS_USER_POOL_CLIENT_ID ??'',
              identityPoolId:'',
              loginWith: {
                email: true,
              },
              signUpVerificationMethod: "code",
              userAttributes: {
                email: {
                  required: true,
                },
              },
              allowGuestAccess: true,
              passwordFormat: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireNumbers: true,
                requireSpecialCharacters: true,
              },
            },
        }
    }
