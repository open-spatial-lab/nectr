import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'

import { PulumiApp } from '@webiny/pulumi'
import { CoreOutput } from '@webiny/pulumi-aws/apps/common'
import { getAwsAccountId, getAwsRegion } from '@webiny/pulumi-aws/apps/awsUtils'
import { type DataApiParams} from './createDataApp'

export function createDataLambdaPolicy(app: PulumiApp, params: DataApiParams, cacheTableArn: pulumi.Output<string>) {
  const core = app.getModule(CoreOutput)
  const awsAccountId = getAwsAccountId(app)
  const awsRegion = getAwsRegion(app)

  return app.addResource(aws.iam.Policy, {
    name: 'DataApiExportTaskLambdaPolicy',
    config: {
      description: 'This policy enables access to Dynamodb',
      policy: {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'AllowDynamoDBAccess',
            Effect: 'Allow',
            Action: [
              'dynamodb:BatchGetItem',
              'dynamodb:GetItem',
              'dynamodb:Query',
              'dynamodb:PutItem'
            ],
            Resource: [
              pulumi.interpolate`${core.primaryDynamodbTableArn}`,
              pulumi.interpolate`${core.primaryDynamodbTableArn}/*`
            ]
          },
          {
            Sid: 'PermissionForS3',
            Effect: 'Allow',
            Action: [
              's3:GetObjectAcl',
              's3:GetObject',
              's3:ListBucket',
              's3:PutObject',
              's3:PutObjectAcl',
              's3:DeleteObject',
              'cognito-idp:DescribeUserPoolClient',
              'cognito-idp:DescribeUserPoolDomain',
              'cognito-idp:DescribeUserPool',
              'cognito-idp:ListUserPoolClients',
              'cognito-idp:ListUserPoolDomains',
              'cognito-idp:ListUserPools',
              'cognito-idp:AdminGetUser',
              'cognito-idp:AdminInitiateAuth',
              'cognito-idp:AdminRespondToAuthChallenge',
              'cognito-idp:AssociateSoftwareToken',
              // read and write dynamodb
              'dynamodb:BatchGetItem',
              'dynamodb:GetItem',
              'dynamodb:Query',
              'dynamodb:PutItem',
              'dynamodb:UpdateItem',
              'dynamodb:DeleteItem'
            ],
            Resource: [
              pulumi.interpolate`${params.env['S3_BUCKET'].arn}/*`,
              pulumi.interpolate`${params.env['S3_BUCKET'].arn}`,
              pulumi.interpolate`arn:aws:s3:::${core.fileManagerBucketId}/*`,
              pulumi.interpolate`arn:aws:s3:::${core.fileManagerBucketId}`,
              pulumi.interpolate`${core.cognitoUserPoolArn}/*`,
              pulumi.interpolate`${cacheTableArn}`.apply(arn => `${arn}`)
            ]
            // Principal: "*"
          },
          {
            Sid: 'PermissionForLambda',
            Effect: 'Allow',
            Action: ['lambda:InvokeFunction'],
            Resource: pulumi.interpolate`arn:aws:lambda:${awsRegion}:${awsAccountId}:function:*`
          }
        ]
      }
    }
  })
}