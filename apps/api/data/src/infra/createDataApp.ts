import { ApiGateway, ApiCloudfront } from '@webiny/pulumi-aws'
// import { DataApiCloudfront } from './createDataCloudfront'
import { type ApiPulumiApp } from '@webiny/pulumi-aws'
import { CoreOutput } from '@webiny/pulumi-aws'
import { DataFunction } from './createDataFunction'
import { createDataBucket } from './createDataBucket'

export interface DataApiParams {
  env: Record<string, any>
}

export const createDataApp = (app: ApiPulumiApp) => {
  const { resources, getModule } = app

  const { primaryDynamodbTableName, elasticsearchDomainEndpoint, elasticsearchDynamodbTableName } =
    getModule(CoreOutput)
  const name = 'api-data-bucket'

  const { dataBucket, originIdentity } = createDataBucket(app, name)
  const cloudfront = app.getModule(ApiCloudfront)

  const {
    data: {
      dataApiGateway
    }
  } = app.addModule(DataFunction(dataBucket), {
    env: {
      DB_TABLE: primaryDynamodbTableName,
      DB_TABLE_ELASTICSEARCH: elasticsearchDynamodbTableName,
      ELASTIC_SEARCH_ENDPOINT: elasticsearchDomainEndpoint,
      ELASTIC_SEARCH_INDEX_PREFIX: process.env.ELASTIC_SEARCH_INDEX_PREFIX,
      S3_BUCKET: dataBucket.output,
      API_URL: cloudfront.output.domainName
    }
  })
  console.log('resources', resources.fileManager.functions.download.config.code)
  resources.cloudfront.config.origins(origins => {
    return [
      ...origins,
      {
        domainName: dataApiGateway.stage.output.invokeUrl.apply(
          (url: string) => new URL(url).hostname
        ),
        originPath: dataApiGateway.stage.output.invokeUrl.apply(
          (url: string) => new URL(url).pathname
        ),
        originId: dataApiGateway.api.output.name,
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
    ]
  })
  resources.cloudfront.config.orderedCacheBehaviors(orderedBehaviors => {
    if (!orderedBehaviors) {
      return orderedBehaviors
    }
    const behaviors = orderedBehaviors.map(behavior => behavior)
    behaviors.push({
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
      targetOriginId: dataApiGateway.api.output.name.apply(v => `${v}`) as unknown as string
    })
    behaviors.push({
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
      targetOriginId: dataBucket.output.id.apply(v => `${v}`) as unknown as string
    })
    return behaviors
  })
}
