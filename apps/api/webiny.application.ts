import { createApiApp } from '@webiny/serverless-cms-aws'
import { CoreOutput } from '@webiny/pulumi-aws'
import { DataFunction } from './data/src/infra/createDataApp'
import { injectDataPermissions } from './data/src/infra/injectPermissions'
import { addConfigAfterDeploy } from './webiny.afterDeploy.additionalOrigins'
import { createDataBucket } from './data/src/infra/createDataBucket'
import { ApiGateway, ApiCloudfront } from '@webiny/pulumi-aws'

export default createApiApp({
  pulumiResourceNamePrefix: 'wby-',
  plugins: [injectDataPermissions(), addConfigAfterDeploy()],
  pulumi(app) {
    const dataApp = createDataApp(app)
  }
})

import { type ApiPulumiApp } from '@webiny/pulumi-aws'
import { DataApiCloudfront } from './data/src/infra/createDataCloudfront'
const createDataApp = (app: ApiPulumiApp) => {
  const { resources, getModule } = app

  const { primaryDynamodbTableName, elasticsearchDomainEndpoint, elasticsearchDynamodbTableName } =
    getModule(CoreOutput)
  const name = 'api-data-bucket'

  const { dataBucket, originIdentity } = createDataBucket(app, name)
  const gateway = app.getModule(ApiGateway)
  const cloudfront = app.getModule(ApiCloudfront)

  const { data: { dataApiGateway, functions: {dataQuery} } } = app.addModule(DataFunction(dataBucket), {
    env: {
      DB_TABLE: primaryDynamodbTableName,
      DB_TABLE_ELASTICSEARCH: elasticsearchDynamodbTableName,
      ELASTIC_SEARCH_ENDPOINT: elasticsearchDomainEndpoint,
      ELASTIC_SEARCH_INDEX_PREFIX: process.env.ELASTIC_SEARCH_INDEX_PREFIX,
      S3_BUCKET: dataBucket.output,
      API_URL: cloudfront.output.domainName
    }
  })
  // const DataCloudfront = app.addModule(DataApiCloudfront(dataBucket, dataApiGateway))

  // gateway.addRoute('api-data-query', {
  //   path: '/data-query',
  //   method: 'ANY',
  //   function: 'data-query'
  // })

  resources.cloudfront.config.origins(origins => {
    return [
      ...origins,
      {
        domainName: dataApiGateway.stage.output.invokeUrl.apply((url: string) => new URL(url).hostname),
        originPath: dataApiGateway.stage.output.invokeUrl.apply((url: string) => new URL(url).pathname),
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
