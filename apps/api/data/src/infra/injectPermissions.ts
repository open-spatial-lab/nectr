import { CliContext } from "@webiny/cli/types";
import * as fs from "fs";
import * as path from "path";

export const injectDataPermissions = () => ({
    type: "hook-after-build",
    name: "hook-after-build-inject-data-permissions",
    async hook({ projectApplication }: Record<string, any>, context: CliContext) {
        const workspacePath = projectApplication.config.pulumi.paths;
        // console.log(workspacePath);
        // const handlersPaths = [
        //     path.join(workspacePath, "graphql", "build"),
        //     path.join(workspacePath, "headlessCMS", "build")
        // ];
    }
});
