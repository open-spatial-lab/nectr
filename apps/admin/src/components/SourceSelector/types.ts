import { SourceMeta } from '../QueryBuilder/types'

export type SourceSelectorProps = {
  sources: SourceMeta[]
  onChange: (source: SourceMeta) => void
  value?: SourceMeta
  label?: string
  showMeta?: boolean
  disabled?: boolean
  showDerived?: boolean
}
