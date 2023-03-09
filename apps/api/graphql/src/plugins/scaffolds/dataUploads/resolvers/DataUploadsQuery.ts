import { DataUploadEntity, DataUploadsPermission } from "../types";
import { DataUpload } from "../entities";
import DataUploadsResolver from "./DataUploadsResolver";

// We use this when specifying the return types of the getPermission function call (below).
import { FullAccessPermission } from "@webiny/api-security/types";
/**
 * Contains base `getDataUpload` and `listDataUploads` GraphQL resolver functions.
 * Feel free to adjust the code to your needs. Also, note that at some point in time, you will
 * most probably want to implement security-related checks.
 * https://www.webiny.com/docs/how-to-guides/scaffolding/extend-graphql-api#essential-files
 */

interface GetDataUploadParams {
    id: string;
}

interface ListDataUploadsParams {
    sort?: "createdOn_ASC" | "createdOn_DESC";
    limit?: number;
    after?: string;
    before?: string;
}

interface ListDataUploadsResponse {
    data: DataUploadEntity[];
    meta: { limit: number; after: string | null; before: string | null };
}

interface DataUploadsQuery {
    getDataUpload(params: GetDataUploadParams): Promise<DataUploadEntity>;
    listDataUploads(params: ListDataUploadsParams): Promise<ListDataUploadsResponse>;
}

interface DataUploadsQueryParams {
    limit?: number;
    reverse?: boolean;
    gt?: string | number;
    lt?: string | number;
}

interface DataUploadsMetaParams {
    limit: number;
    after: string | null;
    before: string | null;
}

/**
 * To define our GraphQL resolvers, we are using the "class method resolvers" approach.
 * https://www.graphql-tools.com/docs/resolvers#class-method-resolvers
 */
export default class DataUploadsQueryImplementation
    extends DataUploadsResolver
    implements DataUploadsQuery
{
    /**
     * Returns a single DataUpload entry from the database.
     * @param id
     */
    async getDataUpload({ id }: GetDataUploadParams) {
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

        // Finally, if current identity doesn't have access, we immediately exit.
        if (!hasAccess) {
            throw new Error("Not authorized.");
        }
        // Query the database and return the entry. If entry was not found, an error is thrown.
        const { Item: dataUpload } = await DataUpload.get({ PK: this.getPK(), SK: id });
        if (!dataUpload) {
            throw new Error(`DataUpload "${id}" not found.`);
        }
        return dataUpload;
    }

    /**
     * List multiple DataUpload entries from the database.
     * Supports basic sorting and cursor-based pagination.
     * @param limit
     * @param sort
     * @param after
     * @param before
     */
    async listDataUploads({ limit = 10, sort, after, before }: ListDataUploadsParams) {
        const PK = this.getPK();
        const query: DataUploadsQueryParams = {
            limit,
            reverse: sort !== "createdOn_ASC",
            gt: undefined,
            lt: undefined
        };
        const meta: DataUploadsMetaParams = { limit, after: null, before: null };

        // The query is constructed differently, depending on the "before" or "after" values.
        if (before) {
            query.reverse = !query.reverse;
            if (query.reverse) {
                query.lt = before;
            } else {
                query.gt = before;
            }

            const { Items } = await DataUpload.query(PK, { ...query, limit: limit + 1 });

            const data = Items.slice(0, limit).reverse();

            const hasBefore = Items.length > limit;
            if (hasBefore) {
                meta.before = Items[Items.length - 1].id;
            }

            meta.after = Items[0].id;

            return { data, meta };
        }

        if (after) {
            if (query.reverse) {
                query.lt = after;
            } else {
                query.gt = after;
            }
        }

        const { Items } = await DataUpload.query(PK, { ...query, limit: limit + 1 });

        const data = Items.slice(0, limit);

        const hasAfter = Items.length > limit;
        if (hasAfter) {
            meta.after = Items[limit - 1].id;
        }

        if (after) {
            meta.before = Items[0].id;
        }

        return { data, meta };
    }
}
