// If our GraphQL API uses Webiny Security Framework, we can retrieve the
// currently logged in identity and assign it to the `createdBy` property.
// https://www.webiny.com/docs/key-topics/security-framework/introduction
import { SecurityIdentity } from "@webiny/api-security/types";
import { MetaColumnSchema } from "admin/src/components/QueryBuilder/types";

export interface DatasetEntity {
    PK: string;
    SK: string;
    id: string;
    title: string;
    description?: string;
    createdOn: string;
    savedOn: string;
    createdBy: Pick<SecurityIdentity, "id" | "displayName" | "type">;
    webinyVersion: string;
    isPublic: boolean;
    columns: Array<Pick<MetaColumnSchema, 'name'|'description'|'type'>>;
    filename: string;
}

export interface DatasetColumnEntity {
    id: string;
    type: string;
    description: string;
}
