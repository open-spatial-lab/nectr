import { DataUploadEntity } from "../types";
/**
 * Package mdbid is missing types.
 */
// @ts-ignore
import mdbid from "mdbid";
import { DataUpload } from "../entities";
import DataUploadsResolver from "./DataUploadsResolver";
import { FullAccessPermission } from "@webiny/api-security/types";
/**
 * Contains base `createDataUpload`, `updateDataUpload`, and `deleteDataUpload` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement custom data validation and security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface CreateDataUploadParams {
    data: {
        title: string;
        description?: string;
    };
}

interface UpdateDataUploadParams {
    id: string;
    data: {
        title: string;
        description?: string;
    };
}

interface DeleteDataUploadParams {
    id: string;
}

interface DataUploadsMutation {
    createDataUpload(params: CreateDataUploadParams): Promise<DataUploadEntity>;
    updateDataUpload(params: UpdateDataUploadParams): Promise<DataUploadEntity>;
    deleteDataUpload(params: DeleteDataUploadParams): Promise<DataUploadEntity>;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class DataUploadsMutationImplementation
    extends DataUploadsResolver
    implements DataUploadsMutation
{
    async authorize() {
        const permission = await this.context.security.getPermission<
            DataUploadsPermission | FullAccessPermission
        >("data-uploads");

        if (!permission) {
            throw new Error("Not authorized.");
        }
        // means we are dealing with the super admin, who has unlimited access.
        let hasAccess = permission.name === "*";
        if (!hasAccess) {
            // If not super admin, let's check if we have the "r" in the `rwd` property.
            hasAccess =
                permission.name === "data-uploads" &&
                permission.rwd &&
                permission.rwd.includes("r");
        }
    }

    /**
     * Creates and returns a new DataUpload entry.
     * @param data
     */
    async createDataUpload({ data }: CreateDataUploadParams) {
        await this.authorize();
        // If our GraphQL API uses Webiny Security Framework, we can retrieve the
        // currently logged in identity and assign it to the `createdBy` property.
        // https://www.webiny.com/docs/key-topics/security-framework/introduction
        const { security } = this.context;

        // We use `mdbid` (https://www.npmjs.com/package/mdbid) library to generate
        // a random, unique, and sequential (sortable) ID for our new entry.
        const id = mdbid();

        const identity = await security.getIdentity();
        const dataUpload = {
            ...data,
            PK: this.getPK(),
            SK: id,
            id,
            createdOn: new Date().toISOString(),
            savedOn: new Date().toISOString(),
            createdBy: identity && {
                id: identity.id,
                type: identity.type,
                displayName: identity.displayName
            },
            webinyVersion: process.env.WEBINY_VERSION
        };

        // Will throw an error if something goes wrong.
        await DataUpload.put(dataUpload);

        return dataUpload;
    }

    /**
     * Updates and returns an existing DataUpload entry.
     * @param id
     * @param data
     */
    async updateDataUpload({ id, data }: UpdateDataUploadParams) {
        await this.authorize();
        const permission = await this.context.security.getPermission<
            DataUploadsPermission | FullAccessPermission
        >("data-uploads");

        if (!permission) {
            throw new Error("Not authorized.");
        }

        const { Item: dataUpload } = await DataUpload.get({ PK: this.getPK(), SK: id });
        if (!dataUpload) {
            throw new Error(`DataUpload "${id}" not found.`);
        }

        const updatedDataUpload = { ...dataUpload, ...data };

        // Will throw an error if something goes wrong.
        await DataUpload.update(updatedDataUpload);

        return updatedDataUpload;
    }

    /**
     * Deletes and returns an existing DataUpload entry.
     * @param id
     */
    async deleteDataUpload({ id }: DeleteDataUploadParams) {
        await this.authorize();
        // If entry is not found, we throw an error.
        const { Item: dataUpload } = await DataUpload.get({ PK: this.getPK(), SK: id });
        if (!dataUpload) {
            throw new Error(`DataUpload "${id}" not found.`);
        }

        // Will throw an error if something goes wrong.
        await DataUpload.delete(dataUpload);

        return dataUpload;
    }
}
