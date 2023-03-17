import * as path from "path";
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

import { createAppModule, PulumiApp, PulumiAppModule } from "@webiny/pulumi";
import { CoreOutput } from "@webiny/pulumi-aws/apps/common";
import { createLambdaRole, getCommonLambdaEnvVariables } from "@webiny/pulumi-aws/apps/lambdaUtils";
import { getAwsAccountId, getAwsRegion } from "@webiny/pulumi-aws/apps/awsUtils";
import { ApiGateway }  from "@webiny/pulumi-aws";

interface DataApiParams {
    env: Record<string, any>;
}

export type DataGateway = PulumiAppModule<typeof DataGateway>;

export const DataGateway = createAppModule({
    name: "PublicDataApi",
    config(app: PulumiApp, params: DataApiParams) {
        const core = app.getModule(CoreOutput);
        const dataResources = createDataResources(app, params);

        return {
            data: dataResources
        };
    }
});

function createDataResources(app: PulumiApp, params: DataApiParams) {
    const core = app.getModule(CoreOutput);
    const apiGateway = app.getModule(ApiGateway);

    const policy = createReadOnlyLambdaPolicy(app);
    const role = createLambdaRole(app, {
        name: "data-api-lambda-role",
        policy: policy.output
    }); 
    const awsRegion = getAwsRegion(app);
    const dataQuery = app.addResource(aws.lambda.Function, {
        name: "data-api-runner",
        config: {
            role: role.output.arn,
            runtime: "nodejs14.x",
            handler: "handler.handler",
            timeout: 60,
            memorySize: 4096,
            description: "Runs data jobs for the Nectr data API",
            // todo: Path to my bundled code
            code: new pulumi.asset.AssetArchive({
                ".": new pulumi.asset.FileArchive(
                    path.join(app.paths.workspace, "data/build")
                )
            }),
            layers: ['arn:aws:lambda:us-east-2:041475135427:layer:duckdb-nodejs-layer:3'],
            environment: {
                variables: getCommonLambdaEnvVariables().apply(value => ({
                    ...value,
                    ...params.env,
                    S3_BUCKET: core.fileManagerBucketId
                }))
            }
        }
    });
    const dataQueryArn = dataQuery.output.arn
    
    apiGateway.addRoute("api-data-query", {
        path: "/data-query/{id}",
        method: "ANY",
        function: dataQueryArn,
    })

    return {
        role,
        policy,
        functions: {
            dataQuery
        }
    };
}

function createReadOnlyLambdaPolicy(app: PulumiApp) {
    const core = app.getModule(CoreOutput);
    const awsAccountId = getAwsAccountId(app);
    const awsRegion = getAwsRegion(app);

    return app.addResource(aws.iam.Policy, {
        name: "DataApiExportTaskLambdaPolicy",
        config: {
            description: "This policy enables access to Dynamodb",
            policy: {
                Version: "2012-10-17",
                Statement: [
                    {
                        Sid: "AllowDynamoDBAccess",
                        Effect: "Allow",
                        Action: [
                            "dynamodb:BatchGetItem",
                            "dynamodb:GetItem",
                            "dynamodb:Query",
                        ],
                        Resource: [
                            pulumi.interpolate`${core.primaryDynamodbTableArn}`,
                            pulumi.interpolate`${core.primaryDynamodbTableArn}/*`
                        ]
                    },
                    {
                        Sid: "PermissionForS3",
                        Effect: "Allow",
                        Action: [
                            "s3:GetObjectAcl",
                            "s3:GetObject",
                            "s3:ListBucket",
                        ],
                        Resource: [
                            pulumi.interpolate`arn:aws:s3:::${core.fileManagerBucketId}/*`,
                            // We need to explicitly add bucket ARN to "Resource" list for "s3:ListBucket" action.
                            pulumi.interpolate`arn:aws:s3:::${core.fileManagerBucketId}`
                        ]
                    },
                    {
                        Sid: "PermissionForLambda",
                        Effect: "Allow",
                        Action: ["lambda:InvokeFunction"],
                        Resource: pulumi.interpolate`arn:aws:lambda:${awsRegion}:${awsAccountId}:function:*`
                    }
                ]
            }
        }
    });
}