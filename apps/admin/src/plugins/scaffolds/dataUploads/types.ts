// @ts-ignore
import type {
    DataUploadEntity,
    DataUploadsPermission
    // @ts-ignore
} from "../../../../../api/graphql/src/plugins/scaffolds/dataUploads/types";

const DATA_COLUMN_TYPES = ["Text", "Number", "Date", "Boolean"] as const;

const GEO_COLUMN_TYPES = ["Geometry (WKT)", "Geometry (GeoJSON)", "Geometry (WKB)"] as const;

type COLUMN_TYPES = (typeof DATA_COLUMN_TYPES)[number] | (typeof GEO_COLUMN_TYPES)[number];

type ColumnSchema = {
    name: string;
    type: COLUMN_TYPES;
    description: string;
};

export {
    ColumnSchema,
    DataUploadEntity,
    DataUploadsPermission,
    DATA_COLUMN_TYPES,
    GEO_COLUMN_TYPES,
    COLUMN_TYPES
};
