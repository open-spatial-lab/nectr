import React from 'react'
import { useApiDataQueriesForm } from '../useApiDataQueriesForm'
import {
  SourceMeta,
} from '../../../../../../components/QueryBuilder/types'

type ApiDataQueriesReturnType = ReturnType<typeof useApiDataQueriesForm>
type HookQueryProperties = Pick<ApiDataQueriesReturnType, 'loading' | 'emptyViewIsShown' | 'currentApiDataQuery' | 'cancelEditing' | 'apiDataQuery' | 'onSubmit' | 'datasets'>
export type FormProps = HookQueryProperties & {
  sources: SourceMeta[]
  setSources: React.Dispatch<React.SetStateAction<SourceMeta[]>>
  availableSources: SourceMeta[]
  currentSources: SourceMeta[]
  dataQueryLink: string | null
  datasetsAndDataviews: any[]
  dataViewTemplate?: string
}

export type useDataViewHook = (templateName?: string) => FormProps & {
  FormComponent: React.FC<FormProps>,
}