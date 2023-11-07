#!/usr/bin/env zx
const imageName = process.env.IMAGE_NAME || 'convert-to-parquet'
const aws_account_id = process.env.AWS_ACCOUNT_ID
const aws_region = process.env.AWS_REGION
const tagName = process.env.TAG_NAME || 'latest'
const ecr_repository_uri = `${aws_account_id}.dkr.ecr.${aws_region}.amazonaws.com`

// Build the image and login to ECR
// logoout first to avoid any issues
// await $`aws ecr get-login-password --region ${aws_region} | docker logout`
// await $`aws ecr-public get-login-password --region ${aws_region} | docker login --username AWS --password-stdin public.ecr.aws`
await $`docker logout public.ecr.aws`
await $`docker build --platform linux/amd64 -t ${imageName}:${tagName} .`
await $`aws ecr get-login-password --region ${aws_region} | docker login --username AWS --password-stdin ${ecr_repository_uri}`

// check if the repo exists on AWS
// otherwise, create the ECR repo
let ECRrepositoryUri = ''
try {
  const existingRepos = await $`aws ecr describe-repositories --repository-names ${imageName}`
  ECRrepositoryUri = JSON.parse(existingRepos)['repositories'][0]['repositoryUri']
} catch {
  console.log("Repository doesn't exist, creating...")
  try {
    const ecrResponse =
      await $`aws ecr create-repository --repository-name ${imageName} --image-scanning-configuration scanOnPush=true --image-tag-mutability MUTABLE`
    ECRrepositoryUri = JSON.parse(ecrResponse)['repository']['repositoryUri']
  } catch {
    console.log('Failed to make repo, exiting...Please check your AWS credentials.')
    process.exit(1)
  }
}

// tag and push the image
await $`docker tag ${imageName}:${tagName} ${ECRrepositoryUri}:${tagName}`
await $`docker push ${ECRrepositoryUri}:${tagName}`