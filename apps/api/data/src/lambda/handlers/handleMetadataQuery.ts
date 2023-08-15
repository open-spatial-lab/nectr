import { S3_BUCKET, connection } from '../..'
import ColumnParser from '../columnParser'

export const handleMetadataQuery = async (
  metadataFile: string,
  params: Record<string, unknown>
) => {
  const metaQuery = metadataFile.includes('.parquet')
    ? `SELECT * FROM parquet_schema('s3://${S3_BUCKET}/${metadataFile}');`
    : `SELECT * FROM 's3://${S3_BUCKET}/${metadataFile}' LIMIT 1;`

  const previewQuery = `SELECT * FROM 's3://${S3_BUCKET}/${metadataFile}' LIMIT 10;`

  const [colData, previewData] = await Promise.all([
    connection.query(metaQuery),
    connection.query(previewQuery)
  ])

  if (colData.ok && previewData.ok) {
    const columnParser = new ColumnParser(metadataFile, colData.result)
    const body = JSON.stringify({
      columns: columnParser.formatColumns(),
      preview: previewData.result
    })
    return {
      statusCode: 200,
      body
    }
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({ columns: colData, table: previewData, params })
    }
  }
}
