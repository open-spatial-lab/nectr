import { useCallback, useReducer } from 'react'
import { useRouter } from '@webiny/react-router'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar'
import { useConfirmationDialog } from '@webiny/app-admin/hooks/useConfirmationDialog'
import { PaginationProp } from '@webiny/ui/List/DataList/types'
import { LIST_API_DATA_QUERIES, DELETE_API_DATA_QUERY } from './graphql'

/**
 * Contains essential data listing functionality - data querying and UI control.
 */

// type TemplateSchema = {
//     columns?: Array<{
//         name: string;
//         alias?: string;
//     }>
// }

interface useApiDataQueriesDataListHook {
  (): {
    apiDataQueries: Array<{
      id: string
      title: string
      template: string
      createdOn: string
      canView: Array<String>
      canEdit: Array<String>
      canDelete: Array<String>
      isPublic: boolean
      [key: string]: any
    }>
    loading: boolean
    pagination: PaginationProp
    refresh: () => void
    setSort: (sort: string) => void
    newApiDataQuery: () => void
    editApiDataQuery: (id: string) => void
    deleteApiDataQuery: (id: string) => void
    currentApiDataQueryId: string | null
  }
}

interface ApiDataQueriesState {
  limit?: any
  after?: any
  before?: any
  sort?: any
}

const reducer = (
  prev: ApiDataQueriesState,
  next: Partial<ApiDataQueriesState>
): ApiDataQueriesState => ({ ...prev, ...next })

export const useApiDataQueriesDataList: useApiDataQueriesDataListHook = () => {
  // Base state and UI React hooks.
  const { history } = useRouter()
  const { showSnackbar } = useSnackbar()
  const { showConfirmation } = useConfirmationDialog()
  const [variables, setVariables] = useReducer(reducer, {
    limit: 99999,
    after: undefined,
    before: undefined,
    sort: undefined
  })

  const searchParams = new URLSearchParams(location.search)
  const currentApiDataQueryId = searchParams.get('id') || null
  // Queries and mutations.
  const listQuery = useQuery(LIST_API_DATA_QUERIES, {
    variables,
    onError: e => showSnackbar(e.message)
  })

  const [deleteIt, deleteMutation] = useMutation(DELETE_API_DATA_QUERY, {
    refetchQueries: [{ query: LIST_API_DATA_QUERIES }]
  })

  const { data: apiDataQueries = [], meta = {} } = listQuery.loading
    ? {}
    : listQuery?.data?.apiDataQueries?.listApiDataQueries || {}
  const loading = [listQuery, deleteMutation].some(item => item.loading)

  // Base CRUD actions - new, edit, and delete.
  const newApiDataQuery = useCallback(() => history.push('/api-data-queries?new'), [])
  const editApiDataQuery = useCallback(id => {
    history.push(`/api-data-queries?id=${id}`)
  }, [])

  const deleteApiDataQuery = useCallback(
    item => {
      showConfirmation(async () => {
        try {
          await deleteIt({
            variables: item
          })

          showSnackbar(`Api Data Query "${item.title}" deleted.`)
          if (currentApiDataQueryId === item.id) {
            history.push(`/api-data-queries`)
          }
        } catch (e) {
          showSnackbar(e.message)
        }
      })
    },
    [currentApiDataQueryId]
  )

  // Sorting.
  const setSort = useCallback(
    value => setVariables({ after: undefined, before: undefined, sort: value }),
    []
  )

  // // Pagination metadata and controls.
  // const setPreviousPage = useCallback(
  //     () => setVariables({ after: undefined, before: meta.before }),
  //     []
  // );
  // const setNextPage = useCallback(
  //     () => setVariables({ after: meta.after, before: undefined }),
  //     []
  // );
  // const setLimit = useCallback(
  //     value => setVariables({ after: undefined, before: undefined, limit: value }),
  //     []
  // );

  const pagination: PaginationProp = {
    // setPerPage: setLimit,
    // perPageOptions: [10, 25, 50],
    // setPreviousPage,
    // setNextPage,
    hasPreviousPage: meta.before,
    hasNextPage: meta.after
  }

  return {
    apiDataQueries,
    loading,
    refresh: (): void => {
      listQuery.refetch()
    },
    pagination,
    setSort,
    newApiDataQuery,
    editApiDataQuery,
    deleteApiDataQuery,
    currentApiDataQueryId
  }
}
