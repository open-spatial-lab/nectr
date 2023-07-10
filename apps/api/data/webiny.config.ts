import { createBuildFunction, createWatchFunction } from "@webiny/project-utils";

const externalOrIgnore = [
    "better-sqlite3",
    "duckdb",
    "mysql",
    "mysql2",
    "oracledb",
    "pg",
    "pg-native",
    "pg-query-stream",
    "sqlite3",
    "tedious",
    // '@aws-sdk/client-s3'
]
const webpack = (config: any) => {
    config.externals = [
        ...(config.externals || []),
        ...externalOrIgnore
    ]
    
    return config;
};

export default {
    commands: {
        build: createBuildFunction({ cwd: __dirname, overrides: { webpack } }),
        watch: createWatchFunction({ cwd: __dirname, overrides: { webpack } })
    }
};