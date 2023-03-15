import { DataUploadEntity, DataUploadsPermission } from "../types";
/**
 * Package mdbid is missing types.
 */
// @ts-ignore
import mdbid from "mdbid";
import { DataUpload } from "../entities";
import DataUploadsResolver from "./DataUploadsResolver";
import { FullAccessPermission } from "@webiny/api-security/types";
import { Authorize } from "~/plugins/utils/authorize";
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
    permission: Authorize<DataUploadsPermission> | null = null;

    initPermission() {
        this.permission = new Authorize<DataUploadsPermission>(
            this.context.security,
            "data-uploads",
        );
    }
    /**
     * Creates and returns a new DataUpload entry.
     * @param data
     */
    async createDataUpload({ data }: CreateDataUploadParams) {
        if(!this.permission) this.initPermission();
        await this.permission?.authorizeRW();
        // If our GraphQL API uses Webiny Security Framework, we can retrieve the
        // currently logged in identity and assign it to the `createdBy` property.
        // https://www.webiny.com/docs/key-topics/security-framework/introduction
        const { security } = this.context;

        // We use `mdbid` (https://www.npmjs.com/package/mdbid) library to generate
        // a random, unique, and sequential (sortable) ID for our new entry.
        const id = mdbid();

        const identity = security.getIdentity();
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
            webinyVersion: process.env.WEBINY_VERSION ? process.env.WEBINY_VERSION : "5.0.0",
        } satisfies DataUploadEntity;

        // Will throw an error if something goes wrong.
        await DataUpload.put(dataUpload);

        return dataUpload 
    }

    /**
     * Updates and returns an existing DataUpload entry.
     * @param id
     * @param data
     */
    async updateDataUpload({ id, data }: UpdateDataUploadParams) {
        if(!this.permission) this.initPermission();
        this.permission?.authorizeRW();

        const { Item: dataUpload } = await DataUpload.get({ PK: this.getPK(), SK: id });
        if (!dataUpload) {
            throw new Error(`DataUpload "${id}" not found.`);
        }
        this.permission?.authorizeEntry(dataUpload, "canEdit");

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
        if(!this.permission) this.initPermission();
        this.permission?.authorizeRWD();

        // If entry is not found, we throw an error.
        const { Item: dataUpload } = await DataUpload.get({ PK: this.getPK(), SK: id });
        if (!dataUpload) {
            throw new Error(`DataUpload "${id}" not found.`);
        }

        this.permission?.authorizeEntry(dataUpload, "canDelete");
        // Will throw an error if something goes wrong.
        await DataUpload.delete(dataUpload);

        return dataUpload;
    }
}
