import { createApiApp } from '@webiny/serverless-cms-aws'
import { ApiGraphql, CoreOutput } from '@webiny/pulumi-aws'
import { DataFunction } from './data/src/infra/createDataApp'
import * as aws from '@pulumi/aws'
import { injectDataPermissions } from './data/src/infra/injectPermissions'
import { PulumiAppResource } from '@webiny/pulumi'

export type DataBucket = PulumiAppResource<typeof aws.s3.Bucket>

export default createApiApp({
  pulumiResourceNamePrefix: 'wby-',
  plugins: [injectDataPermissions()],
  pulumi: app => {
    
    const graphQLModule = app.getModule(ApiGraphql)
    const core = app.getModule(CoreOutput)
    const name = 'data-bucket'

    graphQLModule.addRoute({
      name: 'data-api',
      path: '/data-api/{id}',
      method: 'ANY'
    })

    const dataBucket = app.addResource(aws.s3.Bucket, {
      name,
      config: {
        acl: aws.s3.CannedAcl.Private,
        forceDestroy: true,
        corsRules: [
          {
            allowedHeaders: ['*'],
            allowedMethods: ['POST'],
            allowedOrigins: ['*'],
            maxAgeSeconds: 3000
          }
        ]
      },
      opts: {
        protect: false
      }
    })

    // const blockPublicAccessBlock = app.addResource(aws.s3.BucketPublicAccessBlock, {
    //   name: `${name}-block-public-access`,
    //   config: {
    //     bucket: dataBucket.output.id,
    //     blockPublicAcls: true,
    //     blockPublicPolicy: true,
    //     ignorePublicAcls: true,
    //     restrictPublicBuckets: true
    //   }
    // })

    const data = app.addModule(DataFunction(dataBucket), {
      env: {
        DB_TABLE: core.primaryDynamodbTableName,
        DB_TABLE_ELASTICSEARCH: core.elasticsearchDynamodbTableName,
        ELASTIC_SEARCH_ENDPOINT: core.elasticsearchDomainEndpoint,
        ELASTIC_SEARCH_INDEX_PREFIX: process.env.ELASTIC_SEARCH_INDEX_PREFIX,
        S3_BUCKET: dataBucket.output
      }
    })
  }
})
