import { createApiApp } from '@webiny/serverless-cms-aws'
import { injectDataPermissions } from './data/src/infra/injectPermissions'
import { reallyHackyPluginAfterBuild } from './webiny.aferBuild.hackyFix'
import { createDataApp } from './data/src/infra/createDataApp'

export default createApiApp({
  pulumiResourceNamePrefix: 'wby-',
  plugins: [injectDataPermissions(), reallyHackyPluginAfterBuild()],
  pulumi(app) {
    const dataApp = createDataApp(app)
  }
})