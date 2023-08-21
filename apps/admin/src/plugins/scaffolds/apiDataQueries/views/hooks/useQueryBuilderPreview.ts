import { useCurrentAccessKey } from './useCurrentAccessKey'
import React from 'react'
import { QuerySchema } from '../../../../../../../admin/src/components/QueryBuilder/types'
import { QueryResponse } from '../../../../../../../api/data/src/types/types'
import { config as appConfig } from '@webiny/app/config'
const apiUrl = `${appConfig.getKey('API_URL', process.env.REACT_APP_API_URL)}/data-query/?__adminQuery__=true`

const INITIAL_DATA = {
  ok: false,
  error: 'No data'
} as const

export const useQueryBuilderPreview = (schema: QuerySchema) => {
  const currentToken = useCurrentAccessKey()
  const [data, setData] = React.useState<QueryResponse<Array<Record<string, unknown>>, string>>(INITIAL_DATA)

  const [page, setPage] = React.useState(0)

  const isQuerying = React.useRef(false)

  const query = async () => {
    if (!currentToken || isQuerying.current || !schema?.sources?.length || !schema?.title?.length) {
      setData(INITIAL_DATA)
      return
    }
    isQuerying.current = true
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-Authorization': currentToken
      },
      body: JSON.stringify({
        ...schema,
        limit: 10,
        offset: page * 10
      })
    })
    if (!response.ok) {
      const error = await response.json()
      setData({
        ok: false,
        error: error.message
      })
      isQuerying.current = false
    } else {
      setData({
        ok: true,
        result: await response.json()
      })
      isQuerying.current = false
    }
  }
  const updateTrigger = JSON.stringify({
    id: schema.id,
    sources: schema.sources,
    cols: schema.columns,
    joins: schema.joins,
    groupbys: schema.groupbys,
    page,
  })

  React.useEffect(() => {
    query()
  }, [updateTrigger])

  return {
    data,
    page,
    setPage,
    id: schema.id
  }
}
