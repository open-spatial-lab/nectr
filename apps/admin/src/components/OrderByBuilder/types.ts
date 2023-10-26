import { OrderByQuery, SourceMeta } from '../QueryBuilder/types'

export type OrderByBuilderProps = {
  sources: SourceMeta[]
  orderbys: OrderByQuery[]
  onChange: (orderbys: OrderByQuery[]) => void
}
