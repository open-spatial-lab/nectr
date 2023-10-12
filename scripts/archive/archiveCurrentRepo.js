const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const CLIInfinityProgress = require('cli-infinity-progress')
const constants = require('./constants')

const { bucketName, suffix } = constants

const bar = new CLIInfinityProgress()
const toMb = bytes => Math.round(bytes / 1000000)
const output = fs.createWriteStream(path.join(__dirname, '..', '..', 'archive' + suffix + '.zip'))
const archive = archiver('zip', {
  zlib: { level: 9 }
})

const addListeners = () => {
  output.on('close', () => {
    bar.stop()
    console.log(`${archive.pointer()} total bytes`)
    console.log(`Your infrastructure files have been archived in\n"archive${suffix}.zip".`)
  })

  archive.on('error', err => {
    throw err
  })

  archive.on('progress', progress => {
    if (progress.entries.processed % 10 === 0) {
      bar.setFooter(`${toMb(progress.fs.processedBytes)}MB processed...`)
    }
  })
}

const startArchiving = () => {
  // add files
  bar.setFooter('Progress will be shown here...')
  bar.setHeader(
    "##########\nArchiving your infrastructure files.\nThis will take a while.\nPlease don't close this window."
  )
  bar.start()
  archive.pipe(output)

  archive.file(path.join(__dirname, '..', '..', '.env'), { name: '/.env' })
  archive.directory(path.join(__dirname, '..', '..', '.pulumi/'), '/.pulumi')
  archive.directory(path.join(__dirname, '..', '..', '.webiny/'), '/.webiny')
  archive.finalize()
}

addListeners()
startArchiving()
