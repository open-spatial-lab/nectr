#!/usr/bin/env zx
const imageName = process.env.IMAGE_NAME || 'convert-to-parquet'
const aws_account_id = process.env.AWS_ACCOUNT_ID
const aws_region = process.env.AWS_REGION
const tagName = process.env.TAG_NAME || 'latest'

// Build the image and login to ECR
await $`docker build --platform linux/amd64 -t ${imageName}:${tagName} .`
await $`aws ecr-public get-login-password --region ${aws_region} | docker login --username AWS --password-stdin public.ecr.aws`

// check if the repo exists on AWS
// otherwise, create the ECR repo 

let ECRrepositoryUri = ''
try {
  const existingRepos = await $`aws ecr-public describe-repositories --repository-names ${imageName}`
  ECRrepositoryUri = JSON.parse(existingRepos)["repositories"][0]["repositoryUri"]
} catch {
  console.log("Repository doesn't exist, creating...")
  try {
    const ecrResponse = await $`aws ecr-public create-repository --repository-name ${imageName} --catalog-data file://repositorycatalogdata.json --region ${aws_region}`
    ECRrepositoryUri = JSON.parse(ecrResponse)["repository"]["repositoryUri"]
  } catch {
    console.log("Failed to make repo, exiting...Please check your AWS credentials.")
    process.exit(1)
  }
}

// tag and push the image
await $`docker tag ${imageName}:${tagName} ${ECRrepositoryUri}:${tagName}`
await $`docker push ${ECRrepositoryUri}:${tagName}`

// create file in ../data/src/config
// contains export const converterUri = `${ecr_repository_uri}/${imageName}:${tagName}`
// file name is `converterUri.ts'
await $`touch ../data/src/config/converterUri.ts`
await $`echo "export const converterUri = '${ECRrepositoryUri}:${tagName}'" > ../data/src/config/converterUri.ts`