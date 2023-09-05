import { useCallback, useReducer } from 'react'
import { useRouter } from '@webiny/react-router'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar'
import { useConfirmationDialog } from '@webiny/app-admin/hooks/useConfirmationDialog'
import { PaginationProp } from '@webiny/ui/List/DataList/types'
import { LIST_RAWSQLS, DELETE_RAWSQL } from './graphql'

/**
 * Contains essential data listing functionality - data querying and UI control.
 */

interface useRawsqlsDataListHook {
  (): {
    rawsqls: Array<{
      id: string
      title: string
      description: string
      createdOn: string
      [key: string]: any
    }>
    loading: boolean
    pagination: PaginationProp
    refresh: () => void
    setSort: (sort: string) => void
    newRawsql: () => void
    editRawsql: (id: string) => void
    deleteRawsql: (id: string) => void
    currentRawsqlId: string | null
  }
}

interface RawsqlsState {
  limit?: any
  after?: any
  before?: any
  sort?: any
}

const reducer = (prev: RawsqlsState, next: Partial<RawsqlsState>): RawsqlsState => ({
  ...prev,
  ...next
})

export const useRawsqlsDataList: useRawsqlsDataListHook = () => {
  // Base state and UI React hooks.
  const { history } = useRouter()
  const { showSnackbar } = useSnackbar()
  const { showConfirmation } = useConfirmationDialog()
  const [variables, setVariables] = useReducer(reducer, {
    limit: undefined,
    after: undefined,
    before: undefined,
    sort: undefined
  })

  const searchParams = new URLSearchParams(location.search)
  const currentRawsqlId = searchParams.get('id') || null

  // Queries and mutations.
  const listQuery = useQuery(LIST_RAWSQLS, {
    variables,
    onError: e => showSnackbar(e.message)
  })

  const [deleteIt, deleteMutation] = useMutation(DELETE_RAWSQL, {
    refetchQueries: [{ query: LIST_RAWSQLS }]
  })

  const { data: rawsqls = [], meta = {} } = listQuery.loading
    ? {}
    : listQuery?.data?.rawsqls?.listRawsqls || {}
  const loading = [listQuery, deleteMutation].some(item => item.loading)

  // Base CRUD actions - new, edit, and delete.
  const newRawsql = useCallback(() => history.push('/rawsqls?new'), [])
  const editRawsql = useCallback(id => {
    history.push(`/rawsqls?id=${id}`)
  }, [])

  const deleteRawsql = useCallback(
    item => {
      showConfirmation(async () => {
        try {
          await deleteIt({
            variables: item
          })

          showSnackbar(`Rawsql "${item.title}" deleted.`)
          if (currentRawsqlId === item.id) {
            history.push(`/rawsqls`)
          }
        } catch (e) {
          showSnackbar(e.message)
        }
      })
    },
    [currentRawsqlId]
  )

  // Sorting.
  const setSort = useCallback(
    value => setVariables({ after: undefined, before: undefined, sort: value }),
    []
  )

  // Pagination metadata and controls.
  const setPreviousPage = useCallback(
    () => setVariables({ after: undefined, before: meta.before }),
    []
  )
  const setNextPage = useCallback(() => setVariables({ after: meta.after, before: undefined }), [])
  const setLimit = useCallback(
    value => setVariables({ after: undefined, before: undefined, limit: value }),
    []
  )

  const pagination: PaginationProp = {
    setPerPage: setLimit,
    perPageOptions: [10, 25, 50],
    setPreviousPage,
    setNextPage,
    hasPreviousPage: meta.before,
    hasNextPage: meta.after
  }

  return {
    rawsqls,
    loading,
    refresh: (): void => {
      listQuery.refetch()
    },
    pagination,
    setSort,
    newRawsql,
    editRawsql,
    deleteRawsql,
    currentRawsqlId
  }
}
