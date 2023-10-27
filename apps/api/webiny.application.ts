import { createApiApp } from '@webiny/serverless-cms-aws'
import { reallyHackyPluginAfterBuild } from './webiny.aferBuild.hackyFix'
import { createDataApp } from './data/src/infra/createDataApp'

export default createApiApp({
  pulumiResourceNamePrefix: 'wby-',
  plugins: [reallyHackyPluginAfterBuild()],
  pulumi(app) {

    const dataApp = createDataApp(app)
  }
})