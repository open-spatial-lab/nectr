import { getApiUrl } from "../../../../../../../theme/pageElements/utils/dataApiUrl"
import { useCurrentAccessKey } from "./useCurrentAccessKey"
import React from "react"
import { QuerySchema } from "../../../../../../../admin/src/components/QueryBuilder/types"
import { QueryResponse } from "../../../../../../../api/data/src/types/types"
const endpoint = `${getApiUrl('__')}?__adminQuery__=true`

export const useQueryBuilderPreview = (schema: QuerySchema) => {
  const currentToken = useCurrentAccessKey()
  const [data, setData] = React.useState<QueryResponse<Array<Record<string, unknown>>, string>>({
    ok: false,
    error: "No data",
  })

  const [page, setPage] = React.useState(0)

  const isQuerying = React.useRef(false)

  const query = async () => {
    if (!currentToken || isQuerying.current || !schema.id.length) {
      return
    }
    isQuerying.current = true
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': currentToken,
        'X-Authorization': currentToken,
        'X-Api-Key': currentToken,
        'Content-Type': 'application/json'
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
    page
  })

  React.useEffect(() => {
    query()
  }, [updateTrigger])

  return {
    data,
    page,
    setPage,
  }
}