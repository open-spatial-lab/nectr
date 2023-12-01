// require('dotenv').config()
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const s3 = require('@aws-sdk/client-s3')
const cliProgress = require('cli-progress')
const extract = require('extract-zip')
const { GetObjectCommand, ListObjectsV2Command } = s3
const constants = require('./constants')
const { bucketName, suffix, s3Client } = constants

const rootDir = path.join(__dirname, '..', '..')
const archivePrefix = 'archive' + suffix
const archiveName = archivePrefix + '.zip'
const [pulumiExists, webinyExists, archiveExists] = [
  fs.existsSync(path.join(rootDir, '.pulumi')),
  fs.existsSync(path.join(rootDir, '.webiny')),
  fs.existsSync(path.join(rootDir, archiveName))
]
// await user input to confirm
if (pulumiExists || webinyExists || archiveExists) {
  console.log('This will overwrite your existing infrastructure files. Continue?')

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  rl.question('Continue? (y/n)', answer => {
    if (answer === 'y') {
      rl.close()
      pulumiExists && fs.rmSync(path.join(rootDir, '.pulumi'), { recursive: true })
      webinyExists && fs.rmSync(path.join(rootDir, '.webiny'), { recursive: true })
      download()
    } else {
      rl.close()
      console.log('Aborting.')
    }
  })
} else {
  download()
}

async function download() {
  console.log('Downloading infrastructure archive from S3')
  // find file in s3 bucket
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: archivePrefix,
    MaxKeys: 100
  })
  const response = await s3Client.send(command)
  const sorted = response.Contents.sort((a, b) => b.LastModified - a.LastModified)
  const latest = sorted[0]
  console.log('Downloading archive from', new Date(latest.LastModified).toDateString())
  const key = latest.Key

  const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
  bar.start(toMb(latest.Size), 0)
  await downloadInChunks({
    bucket: bucketName,
    key: key,
    bar
  })

  // unzip archive
  console.log('Unzipping archive.')
  const archivePath = path.join(rootDir, archiveName)
  await extract(archivePath, { dir: rootDir})
  console.log('Archive unzipped.')
  process.exit()
}

const tenMB = 10 * 1024 * 1024
const toMb = bytes => Math.round(bytes / 1000000)

function getObjectRange({ bucket, key, start, end }) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    Range: `bytes=${start}-${end}`
  })

  return s3Client.send(command)
}

const getRangeAndLength = contentRange => {
  const [range, length] = contentRange.split('/')
  const [start, end] = range.split('-')
  return {
    start: parseInt(start),
    end: parseInt(end),
    length: parseInt(length)
  }
}

const isComplete = ({ end, length }) => end === length - 1

// When downloading a large file, you might want to break it down into
// smaller pieces. Amazon S3 accepts a Range header to specify the start
// and end of the byte range to be downloaded.
const downloadInChunks = async ({ bucket, key, bar }) => {
  
  const writeStream = fs
    .createWriteStream(path.join(rootDir, archiveName))
    .on('error', err => console.error(err))
  let rangeAndLength = { start: -1, end: -1, length: -1 }
  while (!isComplete(rangeAndLength)) {
    const { end } = rangeAndLength
    const nextRange = { start: end + 1, end: end + tenMB }
    bar.update(toMb(end))
    const { ContentRange, Body } = await getObjectRange({
      bucket,
      key,
      ...nextRange
    })
    writeStream.write(await Body.transformToByteArray())
    rangeAndLength = getRangeAndLength(ContentRange)
  }
  bar.update(toMb(rangeAndLength.end))
  bar.stop()
  console.log('Download complete.')
}
