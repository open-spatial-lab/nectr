import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { useRouter } from '@webiny/react-router'
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar'
import {
  GET_API_DATA_QUERY,
  CREATE_API_DATA_QUERY,
  UPDATE_API_DATA_QUERY,
  LIST_API_DATA_QUERIES
} from './graphql'
import { LIST_DATASETS } from '../../../datasets/views/hooks/graphql'
import { QuerySchema } from 'apps/admin/src/components/QueryBuilder/types'

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

export const useApiDataQueriesForm = () => {
  const { location, history } = useRouter()
  const { showSnackbar } = useSnackbar()
  const searchParams = new URLSearchParams(location.search)
  const currentApiDataQueryId = searchParams.get('id')

  const getQuery = useQuery(GET_API_DATA_QUERY, {
    variables: { id: currentApiDataQueryId },
    skip: !currentApiDataQueryId,
    onError: error => {
      history.push('/data-views')
      showSnackbar(error.message)
    }
  })
  const datasetsQuery = useQuery(LIST_DATASETS, {
    variables: {
      limit: 999999
    }
  })

  const [create, createMutation] = useMutation(CREATE_API_DATA_QUERY, {
    refetchQueries: [{ query: LIST_API_DATA_QUERIES }]
  })

  const [update, updateMutation] = useMutation(UPDATE_API_DATA_QUERY)

  const loading = [getQuery, createMutation, updateMutation].some(item => item.loading)
  const datasets = datasetsQuery?.data?.datasets?.listDatasets?.data

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
          const { id } = result.data.apiDataQueries.createApiDataQuery
          history.push(`/data-views?id=${id}`)
        }

        showSnackbar('Api Data Query saved successfully.')
      } catch (e) {
        showSnackbar(e.message)
      }
    },
    [currentApiDataQueryId]
  )

  const apiDataQuery = getQuery?.data?.apiDataQueries?.getApiDataQuery as QuerySchema
  const emptyViewIsShown = !searchParams.has('new') && !loading && !apiDataQuery
  const currentApiDataQuery = useCallback(() => history.push('/data-views?new'), [])
  const cancelEditing = useCallback(() => history.push('/data-views'), [])

  return {
    loading,
    emptyViewIsShown,
    currentApiDataQuery,
    cancelEditing,
    apiDataQuery,
    onSubmit,
    datasets
  }
}
