import { createApiApp } from "@webiny/serverless-cms-aws";
import { ApiGraphql, CoreOutput } from "@webiny/pulumi-aws";
import { createAppModule } from "@webiny/pulumi";
import { DataGateway } from "./data/src/createDataApp";

export default createApiApp({
    pulumiResourceNamePrefix: "wby-",
    pulumi: app => {
        const graphQLModule = app.getModule(ApiGraphql);
        graphQLModule.addRoute({
            name: "data-api",
            path: "/data-api/{id}",
            method: "ANY"
        });
        
        const core = app.getModule(CoreOutput);
        const data = app.addModule(DataGateway, {
            env: {
                DB_TABLE: core.primaryDynamodbTableName,
                DB_TABLE_ELASTICSEARCH: core.elasticsearchDynamodbTableName,
                ELASTIC_SEARCH_ENDPOINT: core.elasticsearchDomainEndpoint,
                // Not required. Useful for testing purposes / ephemeral environments.
                // https://www.webiny.com/docs/key-topics/ci-cd/testing/slow-ephemeral-environments
                ELASTIC_SEARCH_INDEX_PREFIX: process.env.ELASTIC_SEARCH_INDEX_PREFIX,
                S3_BUCKET: core.fileManagerBucketId,
            }
        })
    }
});