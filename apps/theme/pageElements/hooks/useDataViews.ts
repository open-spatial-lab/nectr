import React, { useEffect, useState } from 'react'
import { request } from 'graphql-request'

const GQL_API_URL = process.env['REACT_APP_API_URL']! + '/graphql'

// These are the necessary GraphQL queries we'll need in order to retrieve data.
const DATA_VIEWS_QUERY = `{
  apiDataQueries {
    listApiDataQueries {
      data {
        id
        title
        columns {
          name
          sourceId
          alias
        }
        wheres {
          sourceId
          customAlias
          column
          allowCustom
        }
      }
    }
  }
  }`

const cleanColumnName = (columnName: string) => {
  // replace to followed by a number followed by a period with nothing, if it exists in the string
  return columnName.split('.')[1] || columnName
}

type DataOutput = {
  id: string
  title: string
  columns: { name: string; sourceId: string }[]
  wheres: { sourceId: string; customAlias: string; column: string; allowCustom: boolean }[]
}
export default function useDataViews(data: {variables: {source: string}}) {
  const [dataViews, setDataViews] = useState<DataOutput[]>([])

  useEffect(() => {
    // @ts-ignore
    request(GQL_API_URL, DATA_VIEWS_QUERY).then(({ apiDataQueries }) => {
      const mappedDatasets: any = apiDataQueries?.listApiDataQueries?.data?.map((entry: any) => ({
        id: entry.id,
        title: entry.title,
        columns: entry.columns.map((c:any) => c.alias || c.name),
        wheres: entry.wheres.filter((w:any) => w.allowCustom).map((w:any) => w.customAlias||w.column)
      }))
      setDataViews(mappedDatasets)
    })
  }, [])
  const currentDataview = dataViews?.find((item: any) => item.id === data.variables.source)
  const currentColumns = currentDataview?.columns

  return {
    dataViews,
    currentDataview
  }
}
