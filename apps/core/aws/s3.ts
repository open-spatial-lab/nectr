import S3Client from "aws-sdk/clients/s3";

export const S3_BUCKET = process.env.S3_BUCKET as string;
export const s3 = new S3Client({ region: process.env.AWS_REGION  });