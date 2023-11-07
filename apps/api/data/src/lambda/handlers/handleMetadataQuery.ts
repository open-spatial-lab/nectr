import { S3_BUCKET, connection } from "../.."
import ColumnParser from "../columnParser"
import { QueryResponse } from "../../types/types"
import { MetaDataResponse } from "../../types/cacheEntity"

export const handleMetadataQuery = async (
  metadataFile: string,
  params: Record<string, unknown>
): Promise<QueryResponse<MetaDataResponse, unknown>> => {
  const metaQuery = metadataFile.includes(".parquet")
    ? `SELECT * FROM parquet_schema('s3://${S3_BUCKET}/${metadataFile}');`
    : `SELECT * FROM 's3://${S3_BUCKET}/${metadataFile}' LIMIT 1;`

  const previewQuery = `SELECT * FROM 's3://${S3_BUCKET}/${metadataFile}' LIMIT 10;`

  const [colData, previewData] = await Promise.all([
    connection.query(metaQuery),
    connection.query(previewQuery),
  ])
  if (colData.ok && previewData.ok) {
    const columnParser = new ColumnParser(metadataFile, colData.result)
    const result = {
      columns: columnParser.formatColumns(),
      preview: previewData.result,
    }
    return {
      ok: true,
      result,
    }
  } else {
    return {
      ok: false,
      error: {
        body: JSON.stringify({ columns: colData, table: previewData, params }),
      },
    }
  }
}
