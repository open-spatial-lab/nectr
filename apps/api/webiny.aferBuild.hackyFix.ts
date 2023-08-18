import * as fs from 'fs'
import * as path from 'path'

// OK Look. I'm not proud of this.
// There is a better way to do this, but I need to ship this.
// Essentially, we want to prevent the file manager from serving files from the dataset.
// The file manager lambda function is built internally within webiny, so it would take a fork of some 
// pretty major building blocks. And, out of the box, there is some typescript magic not happening.
// Additionally, API gateway route validation seems to have evaporated,
// or at least all the documentation for it is out of date.
// A better way to do this might be to hve a short lambda function check the path 
// then pass the request along to the actual file manager lambda function.
// In the meantime, this injects this line of code directly into the build of the file manager lambda function.
// This is a hack, and it's not a good one. But it works for now.
// Files uploaded through the dataset builder are suffixed with __dataset__,
// so any request that asks for that will be automatically rejected, as if the file doesn't exist.
// Please forgive me these trespasses. I will do better.
export const reallyHackyPluginAfterBuild = () => ({
  type: 'hook-after-build',
  name: 'dumb-hacky-fix',
  async hook(args: any, context: any) {
    
    const rootDir = args.projectApplication.project.root
    const env = args.env
    const fmPath = path.join(rootDir, '.webiny', 'workspaces', 'apps', 'api', 'fileManager', 'download', 'build', 'handler.js')
    const fmHandler = fs.readFileSync(fmPath, 'utf8')
    const functionStartRegex = /\/files\/:path.*?{/;
    const parametersRegex =  /\((.*?)\)/;
    const fmHandlerStart = fmHandler.match(functionStartRegex)
    if (!fmHandlerStart) throw new Error('Could not find file manager handler.')
    const fmHandlerParameters = fmHandlerStart?.[0].match(parametersRegex)
    const startIndex = fmHandlerStart?.index
    const endIndex = (startIndex||0) + fmHandlerStart?.[0].length
    const requestVariableName = fmHandlerParameters?.[1].split('async(')[1].split(',')[0].trim()
    const injectText = `if (${requestVariableName}["params"]["path"].includes("__dataset__")) return {"message":null,"code":"NotFound"};`
    const newHandler = fmHandler.slice(0, endIndex) + injectText + fmHandler.slice(endIndex)
    fs.writeFileSync(fmPath, newHandler, 'utf8')
  }
})
