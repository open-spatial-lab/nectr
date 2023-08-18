import * as s3 from '@aws-sdk/client-s3'

export class BucketManager {
  s3: s3.S3
  bucket: string = process.env['DATA_BUCKET']!
  region: string = process.env['AWS_REGION']!

  constructor() {
    this.s3 = new s3.S3({ region: this.region })
  }

  async putObject(key: string, data: any) {
    await this.s3.putObject({
      Bucket: this.bucket,
      Key: key,
      Body: JSON.stringify(data)
    })
  }
}

export const bucketManager = new BucketManager()