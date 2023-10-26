import { createApiApp } from '@webiny/serverless-cms-aws'
import { addAccountIdToEnv } from './data/src/infra/injectPermissions'
import { reallyHackyPluginAfterBuild } from './webiny.aferBuild.hackyFix'
import { createDataApp } from './data/src/infra/createDataApp'

export default createApiApp({
  pulumiResourceNamePrefix: 'wby-',
  plugins: [addAccountIdToEnv(), reallyHackyPluginAfterBuild()],
  pulumi(app) {

    const dataApp = createDataApp(app)
  }
})