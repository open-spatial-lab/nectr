import { useCallback } from 'react'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { useRouter } from '@webiny/react-router'
import { useSnackbar } from '@webiny/app-admin/hooks/useSnackbar'
import {
  GET_DATA_UPLOAD,
  CREATE_DATA_UPLOAD,
  UPDATE_DATA_UPLOAD,
  LIST_DATA_UPLOADS,
  LIST_USERS
} from './graphql'

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

export const useDataUploadsForm = () => {
  const { location, history } = useRouter()
  const { showSnackbar } = useSnackbar()
  const searchParams = new URLSearchParams(location.search)
  const currentDataUploadId = searchParams.get('id')

  const getQuery = useQuery(GET_DATA_UPLOAD, {
    variables: { id: currentDataUploadId },
    skip: !currentDataUploadId,
    onError: error => {
      history.push('/data-uploads')
      showSnackbar(error.message)
    }
  })

  const users = useQuery(LIST_USERS)
  const userList = users?.data?.adminUsers?.listUsers?.data?.map((f: any) => f.email) || []

  const [create, createMutation] = useMutation(CREATE_DATA_UPLOAD, {
    refetchQueries: [{ query: LIST_DATA_UPLOADS }]
  })

  const [update, updateMutation] = useMutation(UPDATE_DATA_UPLOAD)

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
          const { id } = result.data.dataUploads.createDataUpload
          history.push(`/data-uploads?id=${id}`)
        }

        showSnackbar('Data Upload saved successfully.')
      } catch (e) {
        showSnackbar(e.message)
      }
    },
    [currentDataUploadId]
  )

  const dataUpload = getQuery?.data?.dataUploads?.getDataUpload

  const emptyViewIsShown = !searchParams.has('new') && !loading && !dataUpload
  const currentDataUpload = useCallback(() => history.push('/data-uploads?new'), [])
  const cancelEditing = useCallback(() => history.push('/data-uploads'), [])

  return {
    loading,
    emptyViewIsShown,
    currentDataUpload,
    cancelEditing,
    dataUpload,
    onSubmit,
    userList
  }
}
