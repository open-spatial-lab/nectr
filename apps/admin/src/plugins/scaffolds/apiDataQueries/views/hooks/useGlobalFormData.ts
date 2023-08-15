import { create } from 'zustand'
import { QuerySchema, SourceMeta } from 'apps/admin/src/components/QueryBuilder/types'

export type DataViewStore = {
  schema: QuerySchema
  setSchema: (schema: QuerySchema) => void
  setSources: (sources: SourceMeta[]) => void
}

const defaultQuerySchema = {
  id: '',
  name: ''
} as QuerySchema

export const useDataViewSchema = create<DataViewStore>(set => ({
  schema: defaultQuerySchema,
  setSchema: schema => set(() => ({ schema })),
  setSources: sources => set(state => ({ schema: { ...state.schema, sources } }))
}))
