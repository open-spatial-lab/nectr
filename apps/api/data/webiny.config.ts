import { createBuildFunction, createWatchFunction } from "@webiny/project-utils";

const webpack = (config: any) => {
    (config.externals as any).push("duckdb");
    return config;
};

export default {
    commands: {
        build: createBuildFunction({ cwd: __dirname, overrides: { webpack } }),
        watch: createWatchFunction({ cwd: __dirname, overrides: { webpack } })
    }
};