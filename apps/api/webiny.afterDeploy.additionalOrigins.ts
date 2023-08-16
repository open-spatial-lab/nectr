import * as pulumi from '@pulumi/pulumi'
import * as fs from 'fs'
import * as path from 'path'
import * as aws from '@pulumi/aws'

export const getResource = (
  resources: Array<{ urn: string; id: string }>,
  urnFragment: string,
) => {
  const id = resources.find(f => f.urn.includes(urnFragment))?.id
  if (!id) {
    throw new Error(`Could not find resource with urn containing ${urnFragment}`)
  }
  return id
}

const generateOriginConfig = (
  gateway: aws.apigatewayv2.Api,
  dataBucket: aws.s3.Bucket,
  originIdentity: aws.cloudfront.OriginAccessIdentity
) => {
  return {
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
        targetOriginId: gateway.id
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
        targetOriginId: dataBucket.id
      }
    ],
    origins: [
      {
        domainName: gateway.apiEndpoint,
        originPath: '/',
        originId: gateway.name,
        customOriginConfig: {
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: 'https-only',
          originSslProtocols: ['TLSv1.2']
        }
      },
      {
        domainName: dataBucket.bucketRegionalDomainName,
        originId: dataBucket.id,
        s3OriginConfig: {
          originAccessIdentity: originIdentity.cloudfrontAccessIdentityPath
        }
      }
    ]
  }
}

export const addConfigAfterDeploy = () => ({
  type: 'hook-after-deploy',
  name: 'add-additional-origins',
  async hook(args: any, context: any) {
    // const rootDir = args.projectApplication.project.root
    // const env = args.env
    // const pulumiDir = path.join(rootDir, '.pulumi', 'apps')
    // const apiPulumiDir = path.join(pulumiDir, 'api', '.pulumi')
    // const apiPulumiStacksDir = path.join(apiPulumiDir, 'stacks')
    // const currentStack = path.join(apiPulumiStacksDir, `${env}.json`)
    // const {
    //   checkpoint: {
    //     latest: { resources }
    //   }
    // } = JSON.parse(fs.readFileSync(currentStack, 'utf8'))

    // const cloudfrontId = getResource(
    //   resources,
    //   '-api-cloudfront'
    // )
    // const cloudfront = aws.cloudfront.getDistribution({
    //   id: cloudfrontId,
    // })
    // const bucket = new aws.s3.Bucket(
    //   'test-bucket',
    //   {
    //     bucket: 'test-bucket',
    //     acl: 'private',
    //     forceDestroy: true,
    //     tags: {
    //     }
    //   }
    // )


    // const dataGateway = getResource<aws.apigatewayv2.Api>(
    //   resources,
    //   'data-api-gateway',
    //   '-public-data-api-gateway',
    //   aws.apigatewayv2.Api
    // )
    // const dataBucket = getResource<aws.s3.Bucket>(
    //   resources,
    //   'data-bucket',
    //   '-data-bucket',
    //   aws.s3.Bucket
    // )
    // const dataBucketOriginIdentity = getResource<aws.cloudfront.OriginAccessIdentity>(
    //   resources,
    //   'data-bucket-origin-identity',
    //   '-data-bucket-origin-identity',
    //   aws.cloudfront.OriginAccessIdentity
    // )
    // const { origins, orderedCacheBehaviors } = generateOriginConfig(
    //   dataGateway,
    //   dataBucket,
    //   dataBucketOriginIdentity
    // )
    // const updatedCloudfront = new aws.cloudfront.Distribution(
    //   'aasdf',
    //   {
    //     ...cloudfront,
    //     origins: [
    //       // ...cloudfront.origins,
    //       ...origins
    //     ],
    //     orderedCacheBehaviors: {
    //       ...cloudfront.orderedCacheBehaviors,
    //       ...orderedCacheBehaviors
    //     }
    //   }
    // )
    // // use pulumi to update resources
    // await pulumi.run({
    //   command: 'up',
    // })
  }
})
