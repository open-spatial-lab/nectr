import { DatasetEntity } from "../types";
/**
 * Package mdbid is missing types.
 */
// @ts-ignore
import mdbid from "mdbid";
import { Dataset } from "../entities";
import DatasetsResolver from "./DatasetsResolver";

/**
 * Contains base `createDataset`, `updateDataset`, and `deleteDataset` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement custom data validation and security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface CreateDatasetParams {
    data: {
        title: string;
        description?: string;
    };
}

interface UpdateDatasetParams {
    id: string;
    data: {
        title: string;
        description?: string;
    };
}

interface DeleteDatasetParams {
    id: string;
}

interface DatasetsMutation {
    createDataset(params: CreateDatasetParams): Promise<DatasetEntity>;
    updateDataset(params: UpdateDatasetParams): Promise<DatasetEntity>;
    deleteDataset(params: DeleteDatasetParams): Promise<DatasetEntity>;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class DatasetsMutationImplementation
    extends DatasetsResolver
    implements DatasetsMutation
{
    /**
     * Creates and returns a new Dataset entry.
     * @param data
     */
    async createDataset({ data }: CreateDatasetParams) {
        // If our GraphQL API uses Webiny Security Framework, we can retrieve the
        // currently logged in identity and assign it to the `createdBy` property.
        // https://www.webiny.com/docs/key-topics/security-framework/introduction
        const { security } = this.context;

        // We use `mdbid` (https://www.npmjs.com/package/mdbid) library to generate
        // a random, unique, and sequential (sortable) ID for our new entry.
        const id = mdbid();

        const identity = await security.getIdentity();
        const dataset = {
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
        await Dataset.put(dataset);

        return dataset;
    }

    /**
     * Updates and returns an existing Dataset entry.
     * @param id
     * @param data
     */
    async updateDataset({ id, data }: UpdateDatasetParams) {
        // If entry is not found, we throw an error.
        const { Item: dataset } = await Dataset.get({ PK: this.getPK(), SK: id });
        if (!dataset) {
            throw new Error(`Dataset "${id}" not found.`);
        }

        const updatedDataset = { ...dataset, ...data };

        // Will throw an error if something goes wrong.
        await Dataset.update(updatedDataset);

        return updatedDataset;
    }

    /**
     * Deletes and returns an existing Dataset entry.
     * @param id
     */
    async deleteDataset({ id }: DeleteDatasetParams) {
        // If entry is not found, we throw an error.
        const { Item: dataset } = await Dataset.get({ PK: this.getPK(), SK: id });
        if (!dataset) {
            throw new Error(`Dataset "${id}" not found.`);
        }

        // Will throw an error if something goes wrong.
        await Dataset.delete(dataset);

        return dataset;
    }
}
