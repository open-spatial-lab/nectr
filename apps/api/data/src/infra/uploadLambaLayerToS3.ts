import { type ApiPulumiApp } from "@webiny/pulumi-aws"
import { CoreOutput } from "@webiny/pulumi-aws"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { createReadStream, readFileSync, readSync, statSync } from "fs"
import { join } from "path"

// scripts runs in .webiny/workspaces/apps/api/data/pulumi
// pathToLambdaZip is relative to this file
const pathToLambdaZip = join(
  "..",
  "..",
  "..",
  "..",
  "..",
  "apps",
  "api",
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
  const stats = statSync(pathToLambdaZip)
  // Create a read stream from the file
  const upload = await fmBucket.apply(async (id) => {
    const response = await s3Client.send(
      new PutObjectCommand({
        Bucket: `${id}`,
        Key: "duckdb-layer.zip",
        Body: readFileSync(pathToLambdaZip),
      })
    )
    console.log("######### RESPONSE", response)
    // sleep for 5 seconds to let s3 chill out
    await new Promise((resolve) => setTimeout(resolve, 5000))
  })
  return upload
}
