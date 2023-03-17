import { GetObjectCommand, ListObjectsCommand, S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const bucket = process.env['BUCKET_NAME'];

export default class FileManager {
    async listFiles() {
      const request = new ListObjectsCommand({
        Bucket: bucket,
        MaxKeys: 1000
      });
      const response = await s3.send(request);
      return response.Contents;
    }
    async getFile(key: string) {
      const request = new GetObjectCommand({
        Bucket: bucket,
        Key: key
      });
      const response = await s3.send(request);
      return response.Body;
    }
}