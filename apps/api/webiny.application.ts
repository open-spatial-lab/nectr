import { createApiApp } from "@webiny/serverless-cms-aws";
import { ApiGraphql, CoreOutput } from "@webiny/pulumi-aws";
import { createAppModule } from "@webiny/pulumi";
import { DataFunction } from "./data/src/infra/createDataApp";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { injectDataPermissions } from "./data/src/infra/injectPermissions";


export default createApiApp({
    pulumiResourceNamePrefix: "wby-",
    plugins: [
        injectDataPermissions()
    ],
    pulumi: app => {
        const graphQLModule = app.getModule(ApiGraphql);
        graphQLModule.addRoute({
            name: "data-api",
            path: "/data-api/{id}",
            method: "ANY"
        });
        console.log('################## graphQLModule.policy.config.policy: ')
        console.log(graphQLModule.policy.config.policy)
        
        const core = app.getModule(CoreOutput);

        const name = "data-bucket";
        const dataBucket = app.addResource(aws.s3.Bucket, {
            name,
            config: {
                acl: aws.s3.CannedAcl.Private,
                forceDestroy: false,
                corsRules: [
                    {
                        allowedHeaders: ["*"],
                        allowedMethods: ["POST"],
                        allowedOrigins: ["*"],
                        maxAgeSeconds: 3000
                    }
                ]
            },
            opts: {
                protect: false
            }
        });

        const blockPublicAccessBlock = app.addResource(aws.s3.BucketPublicAccessBlock, {
            name: `${name}-block-public-access`,
            config: {
                bucket: dataBucket.output.id,
                blockPublicAcls: true,
                blockPublicPolicy: true,
                ignorePublicAcls: true,
                restrictPublicBuckets: true
            }
        });
        
        const data = app.addModule(DataFunction, {
            env: {
                DB_TABLE: core.primaryDynamodbTableName,
                DB_TABLE_ELASTICSEARCH: core.elasticsearchDynamodbTableName,
                ELASTIC_SEARCH_ENDPOINT: core.elasticsearchDomainEndpoint,
                // Not required. Useful for testing purposes / ephemeral environments.
                // https://www.webiny.com/docs/key-topics/ci-cd/testing/slow-ephemeral-environments
                ELASTIC_SEARCH_INDEX_PREFIX: process.env.ELASTIC_SEARCH_INDEX_PREFIX,
                S3_BUCKET: dataBucket.output,
            }
        })
    }
});