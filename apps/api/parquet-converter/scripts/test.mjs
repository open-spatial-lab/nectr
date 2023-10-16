#!/usr/bin/env zx
const imageName = process.env.IMAGE_NAME || 'convert-to-parquet'
const tagName = process.env.TAG_NAME || 'latest'

// Build the image and login to ECR
await $`docker run -p 9000:8080 --env MYVAR2=foo ${imageName}:${tagName}`
