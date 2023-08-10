import React from 'react'
import { useDataView } from './hooks/useDataView/useDataView'
import { CircularProgress } from '@mui/material'
import DataViewTemplates from './components/DataViewTemplates'
import { ButtonDefault as Button } from '@webiny/ui/Button'
import { useSecurity } from '@webiny/app-security/hooks/useSecurity'

const findCurrentTokenWithId = (id?: string) => {
  if (!id || typeof localStorage === 'undefined') {
    return
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('CognitoIdentityServiceProvider') && key.endsWith('userData')) {
      const text = localStorage.getItem(key) || ''
      const token = JSON.parse(text)
      if (token?.UserAttributes?.find((attr: any) => attr.Name === 'sub')?.Value === id) {
        const accessToken = localStorage.getItem(key.replace('userData', 'accessToken'))
        return accessToken || ''
      }
    }
  }
  return ''
}
/**
 * Renders a form which enables creating new or editing existing Api Data Query entries.
 * Includes two basic fields - title (required) and template.
 * The form submission-related functionality is located in the `useApiDataQueriesForm` React hook.
 */
const ApiDataQueriesForm: React.FC = () => {
  const [dataViewTemplate, setDataViewTemplate] = React.useState<string | undefined>(undefined)
  const { FormComponent, ...hookProps } = useDataView(dataViewTemplate)
  const { emptyViewIsShown, loading, currentApiDataQuery, apiDataQuery } = hookProps
  const security = useSecurity()
  const { identity } = security

  const currentAccessKey = findCurrentTokenWithId(identity?.id)
  console.log(currentAccessKey)

  if (!apiDataQuery && !dataViewTemplate) {
    return <DataViewTemplates setDataViewTemplate={setDataViewTemplate} />
  }
  console.log(apiDataQuery)

  emptyViewIsShown && currentApiDataQuery()

  if (loading) {
    return <CircularProgress />
  }
  console.log('apiDataQuery', apiDataQuery)
  return (
    <div>
      <Button onClick={() => setDataViewTemplate(undefined)}>&larr; Back to View Templates</Button>
      <FormComponent {...hookProps} />
    </div>
  )
}

export default ApiDataQueriesForm
