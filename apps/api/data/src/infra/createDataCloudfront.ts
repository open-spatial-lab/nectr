import * as aws from '@pulumi/aws'
import { createAppModule, PulumiApp, PulumiAppModule } from '@webiny/pulumi'
import { DataApiGateway } from './createDataGateway'
import { DataBucket } from '../../../webiny.application'

export type DataApiCloudfront = PulumiAppModule<ReturnType<typeof DataApiCloudfront>>

export const DataApiCloudfront = (dataBucket: DataBucket) =>
  createAppModule({
    name: 'DataApiCloudfront',
    config(app: PulumiApp) {
      const gateway = app.getModule(DataApiGateway)
      const name = 'data-api-cache'

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
      const cloudfront = app.addResource(aws.cloudfront.Distribution, {
        name: 'data-api-cloudfront',
        config: {
          waitForDeployment: false,
          isIpv6Enabled: true,
          enabled: true,
          defaultCacheBehavior: {
            compress: true,
            allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
            cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
            forwardedValues: {
              cookies: {
                forward: 'none'
              },
              headers: ['Accept', 'Accept-Language'],
              queryString: true
            },
            // MinTTL <= DefaultTTL <= MaxTTL
            minTtl: 0,
            defaultTtl: 0,
            maxTtl: 86400,
            targetOriginId: gateway.api.output.name,
            viewerProtocolPolicy: 'allow-all'
          },
          orderedCacheBehaviors: [
            {
              compress: true,
              allowedMethods: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
              cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
              forwardedValues: {
                cookies: {
                  forward: 'none'
                },
                headers: ['Accept', 'Accept-Language'],
                queryString: true
              },
              pathPattern: '/data-query*',
              viewerProtocolPolicy: 'allow-all',
              targetOriginId: gateway.api.output.name
            },
            {
              compress: true,
              allowedMethods: ['GET', 'HEAD', 'OPTIONS'],
              cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
              forwardedValues: {
                cookies: {
                  forward: 'none'
                },
                headers: ['Accept', 'Accept-Language'],
                queryString: false
              },
              pathPattern: '/cache*',
              viewerProtocolPolicy: 'allow-all',
              targetOriginId: dataBucket.output.id
            }
          ],
          origins: [
            {
              domainName: gateway.stage.output.invokeUrl.apply(
                (url: string) => new URL(url).hostname
              ),
              originPath: gateway.stage.output.invokeUrl.apply(
                (url: string) => new URL(url).pathname
              ),
              originId: gateway.api.output.name,
              customOriginConfig: {
                httpPort: 80,
                httpsPort: 443,
                originProtocolPolicy: 'https-only',
                originSslProtocols: ['TLSv1.2']
              }
            },
            {
              domainName: dataBucket.output.bucketRegionalDomainName,
              originId: dataBucket.output.id,
              s3OriginConfig: {
                originAccessIdentity: originIdentity.output.cloudfrontAccessIdentityPath
              }
            }
          ],
          restrictions: {
            geoRestriction: {
              restrictionType: 'none'
            }
          },
          viewerCertificate: {
            cloudfrontDefaultCertificate: true
          }
        }
      })
      return {
        cloudfront,
        bucketPolicy,
        bucketPublicAccessBlock,
        originIdentity
      }
    }
  })
