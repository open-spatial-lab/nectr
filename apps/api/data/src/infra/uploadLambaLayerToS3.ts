import { type ApiPulumiApp } from "@webiny/pulumi-aws"
import { CoreOutput } from "@webiny/pulumi-aws"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { readFileSync } from "fs"
import { join } from "path"

// scripts runs in .webiny/workspaces/apps/api/data/pulumi
// pathToLambdaZip is relative to this file
const pathToLambdaZip = join(
  "..",
  "data",
  "src",
  "infra",
  "layer",
  "duckdb-layer.zip"
)

const s3Client = new S3Client({})

export const uploadLambaLayerToS3 = async (app: ApiPulumiApp) => {
  const { getModule } = app
  const coreOutputInfo = getModule(CoreOutput)
  const fmBucket = coreOutputInfo.fileManagerBucketId
  const upload = await fmBucket.apply(async (id) => {
    const response = await s3Client.send(
      new PutObjectCommand({
        Bucket: `${id}`,
        Key: "duckdb-layer.zip",
        Body: readFileSync(pathToLambdaZip),
      })
    )
  })
  return upload
}
