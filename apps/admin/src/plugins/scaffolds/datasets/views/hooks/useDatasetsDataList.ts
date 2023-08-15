import { useCallback, useReducer } from 'react'
import { useRouter } from '@webiny/react-router'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar'
import { useConfirmationDialog } from '@webiny/app-admin/hooks/useConfirmationDialog'
import { PaginationProp } from '@webiny/ui/List/DataList/types'
import { LIST_DATASETS, DELETE_DATASET } from './graphql'

/**
 * Contains essential data listing functionality - data querying and UI control.
 */

interface useDatasetsDataListHook {
  (): {
    datasets: Array<{
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
    newDataset: () => void
    editDataset: (id: string) => void
    deleteDataset: (id: string) => void
    currentDatasetId: string | null
  }
}

interface DatasetsState {
  limit?: any
  after?: any
  before?: any
  sort?: any
}

const reducer = (prev: DatasetsState, next: Partial<DatasetsState>): DatasetsState => ({
  ...prev,
  ...next
})

export const useDatasetsDataList: useDatasetsDataListHook = () => {
  // Base state and UI React hooks.
  const { history } = useRouter()
  const { showSnackbar } = useSnackbar()
  const { showConfirmation } = useConfirmationDialog()
  const [variables, setVariables] = useReducer(reducer, {
    limit: 999999,
    after: undefined,
    before: undefined,
    sort: undefined
  })

  const searchParams = new URLSearchParams(location.search)
  const currentDatasetId = searchParams.get('id') || null

  // Queries and mutations.
  const listQuery = useQuery(LIST_DATASETS, {
    variables,
    onError: e => showSnackbar(e.message)
  })

  const [deleteIt, deleteMutation] = useMutation(DELETE_DATASET, {
    refetchQueries: [{ query: LIST_DATASETS }]
  })

  const { data: datasets = [], meta = {} } = listQuery.loading
    ? {}
    : listQuery?.data?.datasets?.listDatasets || {}
  const loading = [listQuery, deleteMutation].some(item => item.loading)

  // Base CRUD actions - new, edit, and delete.
  const newDataset = useCallback(() => history.push('/datasets?new'), [])
  const editDataset = useCallback(id => {
    history.push(`/datasets?id=${id}`)
  }, [])

  const deleteDataset = useCallback(
    item => {
      showConfirmation(async () => {
        try {
          await deleteIt({
            variables: item
          })

          showSnackbar(`Dataset "${item.title}" deleted.`)
          if (currentDatasetId === item.id) {
            history.push(`/datasets`)
          }
        } catch (e) {
          showSnackbar(e.message)
        }
      })
    },
    [currentDatasetId]
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
    datasets,
    loading,
    refresh: (): void => {
      listQuery.refetch()
    },
    pagination,
    setSort,
    newDataset,
    editDataset,
    deleteDataset,
    currentDatasetId
  }
}
