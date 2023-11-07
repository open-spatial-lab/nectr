import { createApiApp } from '@webiny/serverless-cms-aws'
import { reallyHackyPluginAfterBuild } from './webiny.aferBuild.hackyFix'
import { createDataApp } from './data/src/infra/createDataApp'
import { uploadLambaLayerToS3 } from './data/src/infra/uploadLambaLayerToS3'

export default createApiApp({
  pulumiResourceNamePrefix: 'wby-',
  plugins: [reallyHackyPluginAfterBuild()],
  pulumi(app) {
    uploadLambaLayerToS3(app).then(() => createDataApp(app))
  }
})