require('dotenv').config()
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rootDir = path.join(__dirname, '..', '..')
const [pulumiExists, webinyExists, envExists] = [
  fs.existsSync(path.join(rootDir, '.pulumi')),
  fs.existsSync(path.join(rootDir, '.webiny')),
  fs.existsSync(path.join(rootDir, '.env'))
]

const main = async () => {
  // await user input to confirm
  if (pulumiExists || webinyExists) {
    console.log('This will DELETE your existing infrastructure files. Continue?')

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question('Continue? (y/n)', answer => {
      if (answer === 'y') {
        rl.close()
        pulumiExists && fs.rmSync(path.join(rootDir, '.pulumi'), { recursive: true })
        webinyExists && fs.rmSync(path.join(rootDir, '.webiny'), { recursive: true })
        envExists && fs.rmSync(path.join(rootDir, '.env'))
      } else {
        rl.close()
        console.log('Aborting.')
      }
    })
  }
}
main()
