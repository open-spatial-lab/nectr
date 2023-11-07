import * as path from "path"
import * as pulumi from "@pulumi/pulumi"
import * as aws from "@pulumi/aws"
import { createAppModule, PulumiApp, PulumiAppModule } from "@webiny/pulumi"
import { CoreOutput } from "@webiny/pulumi-aws/apps/common"
import {
  createLambdaRole,
  getCommonLambdaEnvVariables,
} from "@webiny/pulumi-aws/apps/lambdaUtils"
import { DataApiGateway } from "./createDataGateway"
// import { DataApiCloudfront } from './createDataCloudfront'
import { DataBucket } from "./createDataBucket"
import { createDataLambdaPolicy } from "./createDataLambdaPolicy"
import { createDataConverterRole } from "./createDataConverterRole"
import { MAX_MEMORY } from "../config/maxMemory"
export interface DataApiParams {
  env: Record<string, any>
}

export type DataFunction = PulumiAppModule<ReturnType<typeof DataFunction>>

export const DataFunction = (dataBucket: DataBucket) => {
  return createAppModule({
    name: "PublicDataApi",
    config(app: PulumiApp, params: DataApiParams) {
      const dataResources = createDataResources(app, params, dataBucket)
      return {
        data: dataResources,
      }
    },
  })
}

function createDataResources(
  app: PulumiApp,
  params: DataApiParams,
  dataBucket: DataBucket
) {
  if (!params.env["S3_BUCKET"]) {
    throw new Error(
      "Missing S3_BUCKET environment variable. This is required for the data API to work."
    )
  }

  const core = app.getModule(CoreOutput)
  // const fmBucketArn = core.fileManagerBucketId.apply(
  //   (id) => `arn:aws:s3:::${id}`
  // )
  // const dataBucketArn = dataBucket.output

  const cacheTable = app.addResource(aws.dynamodb.Table, {
    name: "data-api-cache",
    config: {
      attributes: [
        { name: "PK", type: "S" },
        { name: "SK", type: "S" },
        { name: "fileid", type: "S" },
        { name: "timestamp", type: "N" },
      ],
      hashKey: "PK",
      rangeKey: "SK",
      billingMode: "PAY_PER_REQUEST",
      globalSecondaryIndexes: [
        {
          name: "timestamp-index",
          hashKey: "fileid",
          rangeKey: "timestamp",
          projectionType: "ALL",
        },
      ],
    },
  })

  // const topicPolicyDocument = aws.iam.getPolicyDocumentOutput({
  //   statements: [
  //     {
  //       sid: "S3EventNotification",
  //       effect: "Allow",
  //       principals: [
  //         {
  //           type: "Service",
  //           identifiers: ["s3.amazonaws.com"],
  //         },
  //       ],
  //       actions: ["SNS:Publish", "SNS:Subscribe"],
  //       resources: ["arn:aws:sns:*:*:wby-data-converter-topic-*"],
  //       conditions: [
  //         {
  //           test: "ArnLike",
  //           variable: "aws:SourceArn",
  //           values: [fmBucketArn],
  //         },
  //       ],
  //     }
  //   ],
  // })

  // const dataConverterTopic = app.addResource(aws.sns.Topic, {
  //   name: "data-converter-topic",
  //   config: {
  //     policy: topicPolicyDocument.apply(
  //       (topicPolicyDocument) => topicPolicyDocument.json
  //     ),
  //   },
  // })
  // const bucketNotification = app.addResource(aws.s3.BucketNotification, {
  //   name: "data-converter-notification",
  //   config: {
  //     bucket: core.fileManagerBucketId,
  //     topics: [
  //       {
  //         id: "data-convert-topic-notifier",
  //         topicArn: dataConverterTopic.output.arn,
  //         events: ["s3:ObjectCreated:*"],
  //         filterSuffix: "__toconvert____dataset__.*",
  //       },
  //     ],
  //   },
  // })

  const policy = createDataLambdaPolicy(
    app,
    params,
    cacheTable.output.arn,
    "DataRunnerTaskLambdaPolicy"
  )
  const role = createLambdaRole(app, {
    name: "data-runner-api-lambda-role",
    policy: policy.output,
  })

  const converterPolicy = createDataLambdaPolicy(
    app,
    params,
    cacheTable.output.arn,
    "DataConvererTaskLambdaPolicy"
  )
  const converterRole = createDataConverterRole(app, {
    name: "converter-3-api-lambda-role",
    policy: converterPolicy.output,
  })

  const duckdbLayer = app.addResource(aws.lambda.LayerVersion, {
    name: "duckdb-layer",
    config: {
      layerName: "duckdb-layer",
      description: "DuckDB",
      licenseInfo: "MIT",
      s3Bucket: core.fileManagerBucketId,
      s3Key: "duckdb-layer.zip",
      compatibleRuntimes: ["nodejs14.x", "nodejs16.x"],
    },
  })

  const dataQuery = app.addResource(aws.lambda.Function, {
    name: "data-api-runner",
    config: {
      role: role.output.arn,
      runtime: "nodejs14.x",
      handler: "handler.handler",
      timeout: 30,
      memorySize: MAX_MEMORY,
      description: "Runs data jobs for the Nectr data API",
      code: new pulumi.asset.AssetArchive({
        ".": new pulumi.asset.FileArchive(
          path.join(app.paths.workspace, "data/build")
        ),
      }),
      layers: [duckdbLayer.output.arn],
      environment: {
        variables: getCommonLambdaEnvVariables().apply((value) => ({
          ...value,
          ...params.env,
          S3_BUCKET: core.fileManagerBucketId,
          EXTENSION_BUCKET: "",
          DATA_BUCKET: pulumi.interpolate`${params.env["S3_BUCKET"].id}`,
          COGNITO_USER_POOL_ID: core.cognitoUserPoolId,
          CACHE_TABLE: cacheTable.output.name,
        })),
      },
    },
  })


  const converter = app.addResource(aws.lambda.Function, {
    name: "data-converter-v2",
    config: {
      role: converterRole.output.arn,
      packageType: "Image",
      timeout: 60,
      memorySize: MAX_MEMORY,
      ephemeralStorage: {
        size: 10240,
      },
      description: "Automatically converts files to Parquet",
      imageUri: `${process.env['AWS_ACCOUNT_ID']}.dkr.ecr.${process.env.AWS_REGION}.amazonaws.com/convert-to-parquet:latest`,
      environment: {
        variables: getCommonLambdaEnvVariables().apply((value) => ({
          ...value,
          ...params.env,
        })),
      },
    },
  })

  // const dataConverterTopicSubscription = app.addResource(aws.sns.TopicSubscription,
  //   {
  //     name: "data-converter-topic-subscription",
  //     config: {
  //       topic: dataConverterTopic.output.arn,
  //       protocol: "lambda",
  //       endpoint: converter.output.arn,
  //       // filterPolicy: {
  //       //   suffix: ["__toconvert____dataset__.*"]
  //       // }
  //     }
  //   }
  // )
  // const allowBucket = app.addResource(aws.lambda.Permission, {
  //   name: 'converter-allow-bucket',
  //   config: {
  //     action: 'lambda:InvokeFunction',
  //     function: converter.output.arn,
  //     principal: 's3.amazonaws.com',
  //     sourceArn: params.env['S3_BUCKET'].arn
  //   }
  // })
  // console.log("S3 BUCKET", pulumi.interpolate`${params.env['S3_BUCKET'].arn}`,)

  // const bucketNotification = app.addResource(aws.s3.BucketNotification, {
  //   name: 'converter-bucket-notification',
  //   config: {
  //     bucket: pulumi.interpolate`${params.env['S3_BUCKET'].id}`,
  //     lambdaFunctions: [
  //       {
  //         lambdaFunctionArn: converter.output.arn,
  //         events: ['s3:ObjectCreated:*'],
  //         filterSuffix: '__toconvert____dataset__.*'
  //       }
  //     ]
  //   }
  // })

  const dataApiGateway = app.addModule(DataApiGateway, {
    "api-data-query": {
      path: "/data-query/{id}",
      method: "ANY",
      function: dataQuery.output.arn,
    },
  })

  return {
    role,
    policy,
    cacheTable,
    dataApiGateway,
    functions: {
      dataQuery,
    },
  }
}
