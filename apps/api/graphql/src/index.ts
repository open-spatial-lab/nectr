import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { createHandler } from "@webiny/handler-aws/gateway";
import graphqlPlugins from "@webiny/handler-graphql";
import { createWcpContext, createWcpGraphQL } from "@webiny/api-wcp";
import i18nPlugins from "@webiny/api-i18n/graphql";
import i18nDynamoDbStorageOperations from "@webiny/api-i18n-ddb";
import {
    createPageBuilderContext,
    createPageBuilderGraphQL
} from "@webiny/api-page-builder/graphql";
import { createStorageOperations as createPageBuilderStorageOperations } from "@webiny/api-page-builder-so-ddb";
import pageBuilderPrerenderingPlugins from "@webiny/api-page-builder/prerendering";
import pageBuilderImportExportPlugins from "@webiny/api-page-builder-import-export/graphql";
import { createStorageOperations as createPageBuilderImportExportStorageOperations } from "@webiny/api-page-builder-import-export-so-ddb";
import prerenderingServicePlugins from "@webiny/api-prerendering-service-aws/client";
import dbPlugins from "@webiny/handler-db";
import { DynamoDbDriver } from "@webiny/db-dynamodb";
import dynamoDbPlugins from "@webiny/db-dynamodb/plugins";
import fileManagerPlugins from "@webiny/api-file-manager/plugins";
import fileManagerDynamoDbStorageOperation from "@webiny/api-file-manager-ddb";
import logsPlugins from "@webiny/handler-logs";
import fileManagerS3 from "@webiny/api-file-manager-s3";
import { createFormBuilder } from "@webiny/api-form-builder";
import { createFormBuilderStorageOperations } from "@webiny/api-form-builder-so-ddb";
import { createHeadlessCmsContext, createHeadlessCmsGraphQL } from "@webiny/api-headless-cms";
import { createStorageOperations as createHeadlessCmsStorageOperations } from "@webiny/api-headless-cms-ddb";
import { createACO } from "@webiny/api-aco";
import securityPlugins from "./security";
import tenantManager from "@webiny/api-tenant-manager";
import { createApiGatewayRoute, createS3Handler } from "@webiny/handler-aws";
/**
 * APW
 */
import { createApwPageBuilderContext, createApwGraphQL } from "@webiny/api-apw";
import { createStorageOperations as createApwSaStorageOperations } from "@webiny/api-apw-scheduler-so-ddb";

// Imports plugins created via scaffolding utilities.
import scaffoldsPlugins from "./plugins/scaffolds";
// https://github.com/jeremydaly/dynamodb-toolbox
import { Table } from "dynamodb-toolbox";

/**
 * Everything starts with a table. Note that the `name` property is passed via an environment
 * variable, which is defined upon cloud infrastructure deployment. On the other hand, while
 * running tests, the value is read from cloud infrastructure state files (that were generated
 * during a previous deployment).
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */


const debug = process.env.DEBUG === "true";

const documentClient = new DocumentClient({
    convertEmptyValues: true,
    region: process.env.AWS_REGION
});

const table = new Table({
    name: process.env.DB_TABLE as string,
    partitionKey: "PK",
    sortKey: "SK",
    entityField: "TYPE",
    DocumentClient: documentClient
});

export const handler = createHandler({
    plugins: [
        createWcpContext(),
        createWcpGraphQL(),
        dynamoDbPlugins(),
        logsPlugins(),
        graphqlPlugins({ debug }),
        dbPlugins({
            table: process.env.DB_TABLE,
            driver: new DynamoDbDriver({ documentClient })
        }),
        securityPlugins({ documentClient }),
        tenantManager(),
        i18nPlugins(),
        i18nDynamoDbStorageOperations(),
        fileManagerPlugins(),
        fileManagerDynamoDbStorageOperation(),
        fileManagerS3(),
        prerenderingServicePlugins({
            eventBus: String(process.env.EVENT_BUS)
        }),
        createPageBuilderContext({
            storageOperations: createPageBuilderStorageOperations({
                documentClient
            })
        }),
        createPageBuilderGraphQL(),
        pageBuilderPrerenderingPlugins(),
        pageBuilderImportExportPlugins({
            storageOperations: createPageBuilderImportExportStorageOperations({ documentClient })
        }),
        createFormBuilder({
            storageOperations: createFormBuilderStorageOperations({
                documentClient
            })
        }),
        createHeadlessCmsContext({
            storageOperations: createHeadlessCmsStorageOperations({
                documentClient
            })
        }),
        createHeadlessCmsGraphQL(),
        createApwGraphQL(),
        createApwPageBuilderContext({
            storageOperations: createApwSaStorageOperations({ documentClient })
        }),
        createACO(),
        scaffoldsPlugins(),
        createApiGatewayRoute(({ onPost, onGet, context }) => {
            onPost("/public-data", async (request, reply) => {
                // we can log the whole request body
                console.log(request.body);
                // and we can send some reply
                return reply
                    .headers({
                        "x-route-example": "yes"
                    })
                    .send({
                        everything: {
                            ok: true
                        }
                    });
            });
            onGet("/public-data", async (request, reply) => {
                let result;
                try {

                    result = await table.query("L#en-US#DataUpload", {
                        // filters: {
                        //         attr: "SK",
                        //         eq: "6408f515d61b7a0008f67e05"
                        // }
                        // eq: "6408f515d61b7a0008f67e05",
                        limit: 1
                    })
                } catch (e) {
                    result = e.message;
                }

                return reply
                    .headers({
                        "x-route-example": "yes"
                    })
                    .send({
                        everything: {
                            ok: true,
                            youDidIt: true,
                            test: JSON.stringify(result)
                        }
                    });
            });
        })
    ],
    http: { debug }
});
