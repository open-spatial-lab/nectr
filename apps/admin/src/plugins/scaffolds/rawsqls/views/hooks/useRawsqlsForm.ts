import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { useRouter } from '@webiny/react-router'
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar'
import { GET_RAWSQL, CREATE_RAWSQL, UPDATE_RAWSQL, LIST_RAWSQLS } from './graphql'

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

export const useRawsqlsForm = () => {
  const { location, history } = useRouter()
  const { showSnackbar } = useSnackbar()
  const searchParams = new URLSearchParams(location.search)
  const currentRawsqlId = searchParams.get('id')

  const getQuery = useQuery(GET_RAWSQL, {
    variables: { id: currentRawsqlId },
    skip: !currentRawsqlId,
    onError: error => {
      history.push('/rawsqls')
      showSnackbar(error.message)
    }
  })

  const [create, createMutation] = useMutation(CREATE_RAWSQL, {
    refetchQueries: [{ query: LIST_RAWSQLS }]
  })

  const [update, updateMutation] = useMutation(UPDATE_RAWSQL)

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
          const { id } = result.data.rawsqls.createRawsql
          history.push(`/rawsqls?id=${id}`)
        }

        showSnackbar('Rawsql saved successfully.')
      } catch (e) {
        showSnackbar(e.message)
      }
    },
    [currentRawsqlId]
  )

  const rawsql = getQuery?.data?.rawsqls?.getRawsql
  const emptyViewIsShown = !searchParams.has('new') && !loading && !rawsql
  const currentRawsql = useCallback(() => history.push('/rawsqls?new'), [])
  const cancelEditing = useCallback(() => history.push('/rawsqls'), [])

  return {
    loading,
    emptyViewIsShown,
    currentRawsql,
    cancelEditing,
    rawsql,
    onSubmit
  }
}
