import { useCurrentAccessKey } from './useCurrentAccessKey'
import React from 'react'
import { QuerySchema } from '../../../../../../../admin/src/components/QueryBuilder/types'
import { QueryResponse } from '../../../../../../../api/data/src/types/types'
import { config as appConfig } from '@webiny/app/config'
const apiUrl = `${appConfig.getKey(
  'API_URL',
  process.env.REACT_APP_API_URL
)}/data-query/?__adminQuery__=true`

const INITIAL_DATA = {
  ok: false,
  error: 'No data'
} as const

export const useQueryBuilderPreview = ({ raw, schema }: { raw?: string; schema?: QuerySchema }) => {
  const currentToken = useCurrentAccessKey()
  const [data, setData] =
    React.useState<QueryResponse<Array<Record<string, unknown>>, string>>(INITIAL_DATA)

  const [page, setPage] = React.useState(0)

  const isQuerying = React.useRef(false)
  const isSchema = Boolean(schema)

  const query = async () => {
    const tokenGood = Boolean(currentToken) && !isQuerying.current
    const schemaGood = Boolean(schema?.sources?.length && schema?.title?.length)
    const rawGood = Boolean(raw?.length)

    const shouldQuery = tokenGood && (isSchema ? schemaGood : rawGood)

    if (!shouldQuery) {
      setData(INITIAL_DATA)
      return
    }

    // if secondary schema.join references right source id from earlier schema.join, reverse the list
    // otherwise leave as is
    const lastJoinIndex = schema?.joins?.length ? schema.joins.length - 1 : 0
    const shouldReverseJoins = schema?.joins?.[lastJoinIndex]?.leftSourceId !== schema?.sources?.[0]?.id
    const joins = shouldReverseJoins ? [...schema?.joins||[]].reverse() : schema?.joins
    const body = isSchema
      ? JSON.stringify({
          ...schema,
          joins,
          limit: 10,
          offset: page * 10
        })
      : JSON.stringify({ raw })

    isQuerying.current = true

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-Authorization': currentToken as string
      },
      body
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
  const nonNullSchema = schema || ({} as QuerySchema)
  const updateTrigger = isSchema
    ? JSON.stringify({
        id: nonNullSchema.id,
        sources: nonNullSchema.sources,
        cols: nonNullSchema.columns,
        joins: nonNullSchema.joins,
        groupbys: nonNullSchema.groupbys,
        orderbys: nonNullSchema.orderbys,
        page
      })
    : raw

  React.useEffect(() => {
    query()
  }, [updateTrigger])

  return {
    data,
    page,
    setPage,
    id: schema?.id || raw
  }
}
