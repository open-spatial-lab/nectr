#!/usr/bin/env zx
const services = [
  {
    // concurrency
    serivceCode: "lambda",
    quotaCode: "L-B99A9384",
    desiredValue: 1000
  },
  // {
  //   // max memory
  //   serivceCode: "lambda",
  //   quotaCode: "L-1216C47A",
  //   desiredValue: 10240
  // }
]

const main = async () => {
  for (const { serivceCode, quotaCode, desiredValue } of services) {
    await $`aws service-quotas request-service-quota-increase --service-code ${serivceCode} --quota-code ${quotaCode} --desired-value ${desiredValue}`
  }
}

main()