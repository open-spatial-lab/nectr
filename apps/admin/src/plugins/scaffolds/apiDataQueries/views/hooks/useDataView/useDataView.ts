import { useEffect, useMemo } from 'react'
import { getApiUrl } from 'theme/pageElements/utils/dataApiUrl'
import { useApiDataQueriesDataList } from '../useApiDataQueriesDataList'
import { useApiDataQueriesForm } from '../useApiDataQueriesForm'
import { useDataViewHook } from './types'
import { getFormComponent } from './utils'
import { useDataViewSchema } from '../useGlobalFormData'

export const useDataView: useDataViewHook = templateName => {
  const {
    loading,
    emptyViewIsShown,
    currentApiDataQuery,
    cancelEditing,
    apiDataQuery,
    onSubmit,
    datasets
  } = useApiDataQueriesForm()

  const { setSchema, setSources, schema } = useDataViewSchema()
  const sources = schema?.sources || []

  const { apiDataQueries } = useApiDataQueriesDataList()
  const currentIds = sources?.map(source => source.id).filter(Boolean) || []
  const datasetsAndDataviews = useMemo(
    () => (datasets && apiDataQueries ? [...datasets, ...apiDataQueries] : []),
    [datasets, apiDataQueries]
  )
  useEffect(() => {
    if (apiDataQuery?.sources?.length) {
      setSources(apiDataQuery.sources)
    }
  }, [apiDataQuery?.sources?.length])

  const availableSources = datasetsAndDataviews.filter((source) => !currentIds.includes(source.id))
  const currentSources = currentIds.map(id => datasetsAndDataviews.find(source => source.id === id)).filter(Boolean)
  const dataQueryLink = apiDataQuery?.id ? getApiUrl(apiDataQuery.id) : null
  // TODO fix circular reference
  // this is React.FC<FormProps> from apps/admin/src/plugins/scaffolds/apiDataQueries/views/components/types.ts
  const FormComponent = getFormComponent(
    templateName || apiDataQuery?.dataViewTemplate || 'verbose'
  )

  return {
    loading,
    emptyViewIsShown,
    currentApiDataQuery,
    cancelEditing,
    apiDataQuery,
    onSubmit,
    datasets,
    sources,
    setSources,
    availableSources,
    currentSources,
    dataQueryLink,
    datasetsAndDataviews,
    FormComponent,
    setSchema
  }
}
