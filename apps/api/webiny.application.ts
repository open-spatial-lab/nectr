import { createApiApp } from '@webiny/serverless-cms-aws'
import { ApiGraphql, CoreOutput } from '@webiny/pulumi-aws'
import { createAppModule } from '@webiny/pulumi'
import { DataFunction } from './data/src/infra/createDataApp'
import * as pulumi from '@pulumi/pulumi'
import * as aws from '@pulumi/aws'
import { injectDataPermissions } from './data/src/infra/injectPermissions'

export default createApiApp({
  pulumiResourceNamePrefix: 'wby-',
  plugins: [injectDataPermissions()],
  pulumi: app => {
    const graphQLModule = app.getModule(ApiGraphql)
    graphQLModule.addRoute({
      name: 'data-api',
      path: '/data-api/{id}',
      method: 'ANY'
    })
    // console.log('################## graphQLModule.policy.config.policy: ')
    // console.log(graphQLModule.policy.config.policy)

    const core = app.getModule(CoreOutput)

    const name = 'data-bucket'
    const dataBucket = app.addResource(aws.s3.Bucket, {
      name,
      config: {
        acl: aws.s3.CannedAcl.Private,
        forceDestroy: false,
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

    const blockPublicAccessBlock = app.addResource(aws.s3.BucketPublicAccessBlock, {
      name: `${name}-block-public-access`,
      config: {
        bucket: dataBucket.output.id,
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true
      }
    })

    const data = app.addModule(DataFunction, {
      env: {
        DB_TABLE: core.primaryDynamodbTableName,
        DB_TABLE_ELASTICSEARCH: core.elasticsearchDynamodbTableName,
        ELASTIC_SEARCH_ENDPOINT: core.elasticsearchDomainEndpoint,
        // Not required. Useful for testing purposes / ephemeral environments.
        // https://www.webiny.com/docs/key-topics/ci-cd/testing/slow-ephemeral-environments
        ELASTIC_SEARCH_INDEX_PREFIX: process.env.ELASTIC_SEARCH_INDEX_PREFIX,
        S3_BUCKET: dataBucket.output
      }
    })

    // add folders "cache" and "extensions" to bucket if they don't exist
    // const cacheFolder = app.addResource(aws.s3.BucketObject, {
    //     name: "cache/",
    //     config: {
    //         bucket: dataBucket.output.id,
    //         acl: aws.s3.CannedAcl.Private,
    //         key: "cache/",
    //         source: new pulumi.asset.FileAsset("cache/")
    //     }
    // });
    // const extensionsFolder = app.addResource(aws.s3.BucketObject, {
    //     name: "extensions/",
    //     config: {
    //         bucket: dataBucket.output.id,
    //         acl: aws.s3.CannedAcl.Private,
    //         key: "extensions/",
    //         source: new pulumi.asset.FileAsset("extensions/")
    //     }
    // });
    // upload extensions from apps/api/data/extensions to bucket folder "extensions"
    // // print cwd
    // console.log('################## cwd: ')
    // console.log(process.cwd())
    // // print __dirname
    // console.log('################## __dirname: ')
    // console.log(__dirname)
    // path to extensions folder cwd + data/extensions
    const extensionsPath = __dirname + '/data/extensions'
    const extensions = ['spatial', 'httpfs']
    extensions.forEach(extension => {
      app.addResource(aws.s3.BucketObject, {
        name: `extensions-${extension}`,
        config: {
          bucket: dataBucket.output.id,
          acl: aws.s3.CannedAcl.Private,
          key: `extensions/${extension}.duckdb_extension`,
          source: new pulumi.asset.FileAsset(`${extensionsPath}/${extension}.duckdb_extension`)
        }
      })
    })
  }
})
