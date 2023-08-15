import * as path from 'path'
import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'

import { createAppModule, PulumiApp, PulumiAppModule } from '@webiny/pulumi'
import { CoreOutput } from '@webiny/pulumi-aws/apps/common'
import { createLambdaRole, getCommonLambdaEnvVariables } from '@webiny/pulumi-aws/apps/lambdaUtils'
import { getAwsAccountId, getAwsRegion } from '@webiny/pulumi-aws/apps/awsUtils'
import { ApiGateway, ApiCloudfront } from '@webiny/pulumi-aws'
import { DataApiGateway } from './createDataGateway'
import { DataApiCloudfront } from './createDataCloudfront'
import { DataBucket } from '../../../webiny.application'

interface DataApiParams {
  env: Record<string, any>
}

export type DataFunction = PulumiAppModule<ReturnType<typeof DataFunction>>

export const DataFunction = (dataBucket: DataBucket) =>
  createAppModule({
    name: 'PublicDataApi',
    config(app: PulumiApp, params: DataApiParams) {
      const core = app.getModule(CoreOutput)
      const dataResources = createDataResources(app, params, dataBucket)
      return {
        data: dataResources
      }
    }
  })

function createDataResources(app: PulumiApp, params: DataApiParams, dataBucket: DataBucket) {
  if (!params.env['S3_BUCKET']) {
    throw new Error(
      'Missing S3_BUCKET environment variable. This is required for the data API to work.'
    )
  }

  const core = app.getModule(CoreOutput)
  const cloudfront = app.getModule(ApiCloudfront)
  const apiGateway = app.getModule(ApiGateway)
  const outputUrl = cloudfront.output

  // add dynamodb table
  const cacheTable = app.addResource(aws.dynamodb.Table, {
    name: 'data-api-cache',
    config: {
      attributes: [
        { name: 'PK', type: 'S' },
        { name: 'SK', type: 'S' },
        { name: 'fileid', type: 'S' },
        { name: 'timestamp', type: 'N' }
      ],
      hashKey: 'PK',
      rangeKey: 'SK',
      billingMode: 'PAY_PER_REQUEST',
      globalSecondaryIndexes: [
        {
          name: 'timestamp-index',
          hashKey: 'fileid',
          rangeKey: 'timestamp',
          projectionType: 'ALL'
        }
      ]
    }
  })

  const cloudfrontUrl = pulumi.interpolate`${outputUrl}`.apply(v => `${v}`)
  // @ts-ignore
  const policy = createReadOnlyLambdaPolicy(app, params, cacheTable.output.arn)
  const role = createLambdaRole(app, {
    name: 'data-api-lambda-role',
    policy: policy.output
  })

  const dataQuery = app.addResource(aws.lambda.Function, {
    name: 'data-api-runner',
    config: {
      role: role.output.arn,
      runtime: 'nodejs14.x',
      handler: 'handler.handler',
      timeout: 60,
      memorySize: 4096,
      description: 'Runs data jobs for the Nectr data API',
      // todo: Path to my bundled code
      code: new pulumi.asset.AssetArchive({
        '.': new pulumi.asset.FileArchive(path.join(app.paths.workspace, 'data/build'))
      }),
      // layers: ['arn:aws:lambda:us-east-2:041475135427:layer:duckdb-nodejs-extensions-x86:1'],
      layers: ['arn:aws:lambda:us-east-2:217827289796:layer:duckdb-test:1'],
      environment: {
        variables: getCommonLambdaEnvVariables().apply(value => ({
          ...value,
          ...params.env,
          S3_BUCKET: core.fileManagerBucketId,
          EXTENSION_BUCKET: '',
          DATA_BUCKET: pulumi.interpolate`${params.env['S3_BUCKET'].id}`,
          COGNITO_USER_POOL_ID: core.cognitoUserPoolId,
          CLOUDFRONT_URL: cloudfrontUrl.apply(v => `${v}`),
          CACHE_TABLE: cacheTable.output.name
        }))
      }
    }
  })
  const dataQueryArn = dataQuery.output.arn

  const dataGateway = app.addModule(DataApiGateway, {
    'api-data-query': {
      path: '/data-query/{id}',
      method: 'ANY',
      function: dataQueryArn
    }
  })
  const { 

  } = app.addModule(DataApiCloudfront(dataBucket))

  return {
    role,
    policy,
    functions: {
      dataQuery
    }
  }
}

function createReadOnlyLambdaPolicy(app: PulumiApp, params: DataApiParams, cacheTableArn: string) {
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
