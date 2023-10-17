import React from 'react'
import { GroupByBuilderProps } from './types'
import { NoPaddingGrid } from '../SplitView'
import { Cell } from '@webiny/ui/Grid'
import { ColumnSelect } from '../ColumnSelect'
import { ColumnSchema } from '../../plugins/scaffolds/dataUploads/types'

const removeColumn = {
  name: 'None',
  type: 'Text',
  description: ''
} as ColumnSchema

export const GroupByBuilder: React.FC<GroupByBuilderProps> = ({ groupbys, sources, onChange }) => {
  const handleChange = (sourceId: string, column: ColumnSchema[]) => {
    const groupby = groupbys.find(groupby => groupby.sourceId === sourceId)
    const columns = column.map(v => v.name)
    if (!groupby) {
      groupbys.push({ sourceId, column: columns })
      // @ts-ignore legacy check
    } else {
      groupby.column = columns
    }
    onChange([...groupbys])
  }

  return (
    <div>
      <NoPaddingGrid>
        {sources.map((source, idx) => {
          const groupby = groupbys.find(groupby => groupby.sourceId === source.id)
          return (
            <React.Fragment key={idx}>
              <Cell span={3}>{source.title}</Cell>
              <Cell span={9}>
                <ColumnSelect
                  // @ts-ignore
                  columns={[removeColumn, ...source.columns]}
                  onChange={value => {
                    // @ts-ignore
                    handleChange(source.id, value)
                  }}
                  // @ts-ignore
                  value={
                    groupby?.column?.map(v => source.columns.find(col => v === col.name)) || []
                  }
                  multi
                ></ColumnSelect>
              </Cell>
            </React.Fragment>
          )
        })}
      </NoPaddingGrid>
    </div>
  )
}
