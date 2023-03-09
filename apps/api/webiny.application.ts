import { createApiApp } from "@webiny/serverless-cms-aws";
import { ApiGraphql } from "@webiny/pulumi-aws";

export default createApiApp({
    pulumiResourceNamePrefix: "wby-",
    pulumi: app => {
        const graphQLModule = app.getModule(ApiGraphql);
        graphQLModule.addRoute({
            // name must be in kebab-case
            name: "data-api",
            // path must start with /
            path: "/data-api/{id}",
            // all http methods allowed + ANY to catch all requests
            method: "ANY"
        });
    }
});
