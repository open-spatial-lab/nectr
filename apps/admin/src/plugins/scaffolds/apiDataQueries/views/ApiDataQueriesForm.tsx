import React from 'react'
import { useDataView } from './hooks/useDataView/useDataView'
import { CircularProgress } from '@mui/material'
import DataViewTemplates from './components/DataViewTemplates'

/**
 * Renders a form which enables creating new or editing existing Api Data Query entries.
 * Includes two basic fields - title (required) and template.
 * The form submission-related functionality is located in the `useApiDataQueriesForm` React hook.
 */
const ApiDataQueriesForm: React.FC = () => {
  const [dataViewTemplate, setDataViewTemplate] = React.useState<string | undefined>(undefined)
  const { FormComponent, ...hookProps } = useDataView(dataViewTemplate)
  const { emptyViewIsShown, loading, currentApiDataQuery, apiDataQuery } = hookProps
  if (!apiDataQuery && !dataViewTemplate) {
    return <DataViewTemplates setDataViewTemplate={setDataViewTemplate} />
  }
  emptyViewIsShown && currentApiDataQuery()
  if (loading) {
    return <CircularProgress />
  }

  return <FormComponent {...hookProps} />
}

export default ApiDataQueriesForm
