#!/usr/bin/env zx
const aws_account_id = process.env.AWS_ACCOUNT_ID
const aws_region = process.env.AWS_REGION
const imageName = process.env.IMAGE_NAME || 'convert'
const tagName = process.env.TAG_NAME || 'latest'
const ecr_repository_uri = `${aws_account_id}.dkr.ecr.${aws_region}.amazonaws.com/convert-to-parquet`

await $`docker tag ${imageName}:${tagName} ${ecr_repository_uri}:${tagName}`
await $`aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin ${ecr_repository_uri}`
await $`docker push ${ecr_repository_uri}:${tagName}`