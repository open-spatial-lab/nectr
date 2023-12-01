import React from 'react'
import { useApiDataQueriesForm } from '../useApiDataQueriesForm'
import { QuerySchema, SourceMeta } from '../../../../../../components/QueryBuilder/types'

type ApiDataQueriesReturnType = ReturnType<typeof useApiDataQueriesForm>
type HookQueryProperties = Pick<
  ApiDataQueriesReturnType,
  | 'loading'
  | 'emptyViewIsShown'
  | 'currentApiDataQuery'
  | 'cancelEditing'
  | 'apiDataQuery'
  | 'onSubmit'
  | 'datasets'
>
export type FormProps = HookQueryProperties & {
  sources: SourceMeta[]
  setSources: (sources: SourceMeta[]) => void
  setSchema: (schema: QuerySchema) => void
  availableSources: SourceMeta[]
  currentSources: SourceMeta[]
  dataQueryLink: string | null
  datasetsAndDataviews: any[]
  dataViewTemplate?: string
  togglePreview?: () => void
  showPreview?: boolean,
  derivedColumns?: any[]
}

export type useDataViewHook = (templateName?: string) => FormProps & {
  FormComponent: React.FC<FormProps>
}
