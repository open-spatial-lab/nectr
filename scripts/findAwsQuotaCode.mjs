#!/usr/bin/env zx
import * as fs from 'fs'

// use aws cli to list services
const services = JSON.parse(
  await $`aws service-quotas list-services --query "Services[].ServiceCode"`
)

let data = []

for (const service of services) {
  const quotas = JSON.parse(
    await $`aws service-quotas list-service-quotas --service-code ${service}`
  )
  data = [
    ...data,
    ...quotas['Quotas']
  ]
}

// data to json
fs.writeFileSync('aws_services.json', JSON.stringify(data, null, 2))