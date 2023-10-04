import { ColumnSchema } from '../../plugins/scaffolds/datasets/types'
import { JoinQuery, QueryBuilderProps, SelectQuery } from '../QueryBuilder'
import { SourceMeta } from '../QueryBuilder/types'

export type SpatialJoinBuilderProps = {
  join: JoinQuery
  leftSource: SourceMeta
  rightSource: SourceMeta
  availableSources: SourceMeta[]
  onChange: (join: JoinQuery[]) => void
}
