const path = require('path')
const fs = require('fs')
const s3 = require('@aws-sdk/client-s3')
const {
  CreateBucketCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand
} = s3
const cliProgress = require('cli-progress')
const constants = require('./constants')
const {
  bucketName,
  suffix,
  s3Client
} = constants


// create a new progress bar instance and use shades_classic theme
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)

async function main() {
  console.log('Uploading infrastructure archive to S3')
  try {
    await s3Client.send(
      new CreateBucketCommand({
        Bucket: bucketName
      })
    )
    console.log(`Bucket ${bucketName} created.`)
  } catch (e){
    console.log(`Bucket ${bucketName} already exists or failed to create bucket.`)
    // console.error(e)
    // bucket exists...
  }

  const today = new Date()
  const isoDate = today.toISOString()
  const key = `archive${suffix}_${isoDate}.zip`

  const archivePath = path.join(__dirname, '..', '..', 'archive'+suffix+'.zip')
  const buffer = fs.readFileSync(archivePath)

  let uploadId

  try {
    const multipartUpload = await s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: key
      })
    )

    uploadId = multipartUpload.UploadId

    const uploadPromises = []
    // Multipart uploads require a minimum size of 5 MB per part.

    const sizeInBytes = Buffer.byteLength(buffer)
    const sizeInMB = Math.ceil(sizeInBytes / 1000000)
    // upload 64mb chunks
    const numParts = Math.ceil(sizeInMB / 64)
    const partSize = Math.ceil(buffer.length / numParts)

    console.log(`Archive size: ${sizeInMB} MB. Uploading in ${numParts} parts.\nThis will take a while, especially if you have a slow internet connection.`)

    let uploadProgress = 0
    bar1.start(numParts, uploadProgress)
    // Upload each part.
    for (let i = 0; i < numParts; i++) {
      const start = i * partSize
      const end = start + partSize
      uploadPromises.push(
        s3Client
          .send(
            new UploadPartCommand({
              Bucket: bucketName,
              Key: key,
              UploadId: uploadId,
              Body: buffer.subarray(start, end),
              PartNumber: i + 1
            })
          )
          .then(d => {
            uploadProgress += 1
            bar1.update(uploadProgress)
            return d
          })
      )
    }

    const uploadResults = await Promise.all(uploadPromises).then(r => {
      bar1.stop()
      return r
    })

    return await s3Client
      .send(
        new CompleteMultipartUploadCommand({
          Bucket: bucketName,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: {
            Parts: uploadResults.map(({ ETag }, i) => ({
              ETag,
              PartNumber: i + 1
            }))
          }
        })
      )
      .then(r => {
        console.log('Upload complete.')
      })

    // Verify the output by downloading the file from the Amazon Simple Storage Service (Amazon S3) console.
    // Because the output is a 25 MB string, text editors might struggle to open the file.
  } catch (err) {
    console.log('Error uploading archive to S3')
    console.error(err)

    if (uploadId) {
      const abortCommand = new AbortMultipartUploadCommand({
        Bucket: bucketName,
        Key: key,
        UploadId: uploadId
      })

      await s3Client.send(abortCommand)
    }
  }
}
main()
