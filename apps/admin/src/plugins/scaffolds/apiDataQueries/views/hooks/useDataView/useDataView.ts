import React, { useEffect, useMemo } from 'react'
import { getApiUrl } from 'theme/pageElements/utils/dataApiUrl'
import { useApiDataQueriesDataList } from '../useApiDataQueriesDataList'
import { useApiDataQueriesForm } from '../useApiDataQueriesForm'

import { SourceMeta } from '../../../../../../components/QueryBuilder/types'
import { useDataViewHook } from './types'
import { getFormComponent } from './utils'

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

  const [sources, setSources] = React.useState<SourceMeta[]>([])
  const { apiDataQueries } = useApiDataQueriesDataList()
  const currentIds = sources?.map(source => source.id) || []
  const datasetsAndDataviews = useMemo(
    () => (datasets && apiDataQueries ? [...datasets, ...apiDataQueries] : []),
    [datasets, apiDataQueries]
  )

  useEffect(() => {
    if (apiDataQuery?.sources?.length) {
      setSources(apiDataQuery.sources)
    }
  }, [apiDataQuery?.sources?.length])

  const { availableSources, currentSources } = useMemo(() => {
    const availableSources: SourceMeta[] = []
    const currentSources: SourceMeta[] = []
    for (const source of datasetsAndDataviews) {
      if (currentIds.includes(source.id)) {
        currentSources.push(source)
      } else {
        availableSources.push(source)
      }
    }
    return {
      availableSources,
      currentSources
    }
  }, [datasetsAndDataviews?.length, JSON.stringify(currentIds)])

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
    FormComponent
  }
}
