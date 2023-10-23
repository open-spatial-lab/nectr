import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { useRouter } from '@webiny/react-router'
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar'
import { GET_DATASET, CREATE_DATASET, UPDATE_DATASET, LIST_DATASETS } from './graphql'

/**
 * Contains essential form functionality: data fetching, form submission, notifications, redirecting, and more.
 */

/**
 * Omits irrelevant values from the submitted form data (`id`, `createdOn`, `savedOn`, `createdBy`).
 * @param formData
 */
const getMutationData = (formData: Record<string, any>) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, createdOn, savedOn, createdBy, ...data } = formData
  return data
}

export const useDatasetsForm = () => {
  const { location, history } = useRouter()
  const { showSnackbar } = useSnackbar()
  const searchParams = new URLSearchParams(location.search)
  const currentDatasetId = searchParams.get('id')

  const getQuery = useQuery(GET_DATASET, {
    variables: { id: currentDatasetId },
    skip: !currentDatasetId,
    onError: error => {
      history.push('/datasets')
      showSnackbar(error.message)
    }
  })

  const [create, createMutation] = useMutation(CREATE_DATASET, {
    refetchQueries: [{ query: LIST_DATASETS }]
  })

  const [update, updateMutation] = useMutation(UPDATE_DATASET)

  const loading = [getQuery, createMutation, updateMutation].some(item => item.loading)

  const onSubmit = useCallback(
    async formData => {
      const { id } = formData
      const data = getMutationData(formData)
      const [operation, options] = id
        ? [update, { variables: { id, data } }]
        : [create, { variables: { data } }]

      try {
        const result = await operation(options)
        if (!id) {
          const { id } = result.data.datasets.createDataset
          history.push(`/datasets?id=${id}`)
        }

        showSnackbar('Dataset saved successfully.')
      } catch (e) {
        showSnackbar(e.message)
      }
    },
    [currentDatasetId]
  )

  const dataset = getQuery?.data?.datasets?.getDataset
  const emptyViewIsShown = !searchParams.has('new') && !loading && !dataset
  const handleNewDataset = useCallback(() => history.push('/datasets?new'), [])
  const cancelEditing = useCallback(() => history.push('/datasets'), [])

  return {
    loading,
    emptyViewIsShown,
    handleNewDataset,
    currentDatasetId,
    cancelEditing,
    dataset,
    onSubmit
  }
}
