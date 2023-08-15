import { useCallback, useReducer } from 'react'
import { useRouter } from '@webiny/react-router'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar'
import { useConfirmationDialog } from '@webiny/app-admin/hooks/useConfirmationDialog'
import { PaginationProp } from '@webiny/ui/List/DataList/types'
import { LIST_DATA_UPLOADS, DELETE_DATA_UPLOAD } from './graphql'

/**
 * Contains essential data listing functionality - data querying and UI control.
 */

interface useDataUploadsDataListHook {
  (): {
    dataUploads: Array<{
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
    newDataUpload: () => void
    editDataUpload: (id: string) => void
    deleteDataUpload: (id: string) => void
    currentDataUploadId: string | null
  }
}

interface DataUploadsState {
  limit?: any
  after?: any
  before?: any
  sort?: any
}

const reducer = (prev: DataUploadsState, next: Partial<DataUploadsState>): DataUploadsState => ({
  ...prev,
  ...next
})

export const useDataUploadsDataList: useDataUploadsDataListHook = () => {
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
  const currentDataUploadId = searchParams.get('id') || null

  // Queries and mutations.
  const listQuery = useQuery(LIST_DATA_UPLOADS, {
    variables,
    onError: e => showSnackbar(e.message)
  })

  const [deleteIt, deleteMutation] = useMutation(DELETE_DATA_UPLOAD, {
    refetchQueries: [{ query: LIST_DATA_UPLOADS }]
  })

  const { data: dataUploads = [], meta = {} } = listQuery.loading
    ? {}
    : listQuery?.data?.dataUploads?.listDataUploads || {}
  const loading = [listQuery, deleteMutation].some(item => item.loading)

  // Base CRUD actions - new, edit, and delete.
  const newDataUpload = useCallback(() => history.push('/data-uploads?new'), [])
  const editDataUpload = useCallback(id => {
    history.push(`/data-uploads?id=${id}`)
  }, [])

  const deleteDataUpload = useCallback(
    item => {
      showConfirmation(async () => {
        try {
          await deleteIt({
            variables: item
          })

          showSnackbar(`Data Upload "${item.title}" deleted.`)
          if (currentDataUploadId === item.id) {
            history.push(`/data-uploads`)
          }
        } catch (e) {
          showSnackbar(e.message)
        }
      })
    },
    [currentDataUploadId]
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
    dataUploads,
    loading,
    refresh: (): void => {
      listQuery.refetch()
    },
    pagination,
    setSort,
    newDataUpload,
    editDataUpload,
    deleteDataUpload,
    currentDataUploadId
  }
}
