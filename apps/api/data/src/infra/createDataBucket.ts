import * as aws from '@pulumi/aws'
import { PulumiAppResource, PulumiApp } from '@webiny/pulumi'

export type DataBucket = PulumiAppResource<typeof aws.s3.Bucket>

export const createDataBucket = <T extends PulumiApp>(app: T, name: string) => {
  const dataBucket = app.addResource(aws.s3.Bucket, {
    name,
    config: {
      acl: aws.s3.CannedAcl.Private,
      forceDestroy: false,
      corsRules: [
        {
          allowedHeaders: ['*'],
          allowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          allowedOrigins: ['https://*.cloudfront.net'],
          exposeHeaders: ['ETag'],
          maxAgeSeconds: 3000
        }
      ]
    },
    opts: {
      protect: false
    }
  })

  const originIdentity = app.addResource(aws.cloudfront.OriginAccessIdentity, {
    name: `${name}-origin-identity`,
    config: {}
  })

  const bucketPolicy = app.addResource(aws.s3.BucketPolicy, {
    name: `${name}-bucket-policy`,
    config: {
      bucket: dataBucket.output.bucket,
      policy: {
        Version: '2012-10-17',
        Statement: dataBucket.output.arn.apply(arn => {
          const statements: aws.iam.PolicyStatement[] = [
            {
              Effect: 'Allow',
              Principal: { AWS: originIdentity.output.iamArn },
              Action: ['s3:ListBucket', 's3:GetObject'],
              Resource: [`${arn}`, `${arn}/*`]
            }
          ]

          return statements
        })
      }
    }
  })

  const bucketPublicAccessBlock = app.addResource(aws.s3.BucketPublicAccessBlock, {
    name: `${name}-bucket-block-access`,
    config: {
      bucket: dataBucket.output.id,
      blockPublicAcls: true,
      blockPublicPolicy: true,
      ignorePublicAcls: true,
      restrictPublicBuckets: true
    }
  })

  return {
    dataBucket,
    originIdentity,
    bucketPolicy,
    bucketPublicAccessBlock
  }
}
