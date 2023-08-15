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
  const handleChange = (sourceId: string, column: string) => {
    const groupby = groupbys.find(groupby => groupby.sourceId === sourceId)
    if (!groupby) {
      groupbys.push({ sourceId, column: column })
    } else {
      groupby.column = column
    }
    onChange([...groupbys])
  }

  const handleRemove = (sourceId: string) => {
    const index = groupbys.findIndex(groupby => groupby.sourceId === sourceId)
    if (index > -1) {
      groupbys.splice(index, 1)
      onChange([...groupbys])
    }
  }

  return (
    <div>
      <NoPaddingGrid>
        {sources.map((source, idx) => (
          <React.Fragment key={idx}>
            <Cell span={3}>{source.title}</Cell>
            <Cell span={9}>
              <ColumnSelect
                // @ts-ignore
                columns={[removeColumn, ...source.columns]}
                onChange={value => {
                  if (value.name === 'None') {
                    handleRemove(source.id)
                  } else {
                    handleChange(source.id, value.name)
                  }
                }}
                // @ts-ignore
                value={source.columns.find(col => col.name === groupbys[idx]?.column) || 'None'}
              ></ColumnSelect>
            </Cell>
          </React.Fragment>
        ))}
      </NoPaddingGrid>
    </div>
  )
}
