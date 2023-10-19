const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') })
const s3 = require('@aws-sdk/client-s3')

const _suffix = process.env.ARCHIVE_SUFFIX
const suffix = _suffix ? `-${_suffix}` : ''
const bucketName = 'webiny-nectr-infrastructure-archive' + suffix
const s3Client = new s3.S3Client({})

module.exports = {
  suffix,
  bucketName,
  s3Client
}
