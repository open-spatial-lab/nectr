// If our GraphQL API uses Webiny Security Framework, we can retrieve the
// currently logged in identity and assign it to the `createdBy` property.
// https://www.webiny.com/docs/key-topics/security-framework/introduction
import { SecurityIdentity } from "@webiny/api-security/types";
import { SecurityPermission } from "@webiny/app-security/types";

export interface DataUploadEntity {
    PK: string;
    SK: string;
    id: string;
    title: string;
    description?: string;
    createdOn: string;
    canView?: Array<{name: string, id: string}>;
    canEdit?: Array<{name: string, id: string}>;
    canDelete?: Array<{name: string, id: string}>;
    savedOn: string;
    isPublic?: boolean;
    createdBy: Pick<SecurityIdentity, "id" | "displayName" | "type">;
    webinyVersion: string;
}

export interface DataUploadPermission extends SecurityPermission {
    name: "data-uploads";
    rwd?: "r" | "rw" | "rwd";
    specialFeature?: boolean;
}