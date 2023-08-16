import * as aws from '@pulumi/aws'
import { createAppModule, PulumiApp, PulumiAppModule } from '@webiny/pulumi'
import { DataApiGateway } from './createDataGateway'
import { DataBucket } from './createDataBucket'

export type DataApiCloudfront = PulumiAppModule<ReturnType<typeof DataApiCloudfront>>

export const DataApiCloudfront = (dataBucket: DataBucket, gateway: any) =>
  createAppModule({
    name: 'DataApiCloudfront',
    config(app: PulumiApp) {
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
              // s3OriginConfig: {
              //   originAccessIdentity: originIdentity.output.cloudfrontAccessIdentityPath
              // }
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
        cloudfront
      }
    }
  })
