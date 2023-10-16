#!/usr/bin/env zx

await `mkdir -p .aws-sam/package`
await `cd .aws-sam/build/$1`
await `zip -r9 ../../package/$1.zip .`