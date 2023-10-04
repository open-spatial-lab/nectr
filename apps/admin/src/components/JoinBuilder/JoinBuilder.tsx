import React from 'react'
import { Cell } from '@webiny/ui/Grid'
import { ButtonPrimary, IconButton } from '@webiny/ui/Button'
import { JoinQuery, SourceMeta } from '../QueryBuilder/types'
import { NoPaddingGrid } from '../SplitView'
import SourceSelector from '../SourceSelector'
import { ColumnSelect } from '../ColumnSelect'
import { ColumnSchema } from '../../plugins/scaffolds/dataUploads/types'
import { ReactComponent as TrashIcon } from '../../assets/trash.svg'
import { ReactComponent as IndentArrow } from '../../assets/indent-arrow.svg'
import { Stack } from '@mui/material'
import JoinTypeSelector from '../ JoinTypeSelector'

export type JoinBuilderProps = {
  joins: JoinQuery[]
  currentSources: SourceMeta[]
  availableSources: SourceMeta[]
  onChange: (sources: JoinQuery[]) => void
}


export const JoinBuilder = ({
  joins,
  currentSources,
  availableSources,
  onChange
}: JoinBuilderProps) => {
  const addJoin = () => {
    onChange([
      ...joins,
      {
        leftSourceId: currentSources[0].id,
        leftOn: currentSources[0].columns[0].name,
        rightSourceId: availableSources[0].id,
        rightOn: availableSources[0].columns[0].name,
        operator: 'left'
      }
    ])
  }
  const updateJoinAtIndex = <T extends keyof JoinQuery>(
    index: number,
    property: T,
    value: JoinQuery[T]
  ) => {
    joins[index][property] = value
    onChange([...joins])
  }

  const removeJoinAtIndex = (index: number) => {
    onChange([...joins.slice(0, index), ...joins.slice(index + 1)])
  }

  const allSources = [...currentSources, ...availableSources]

  return (
    <NoPaddingGrid style={{ width: '100%' }}>
      {joins.map((join, index) => {
        const leftSource = currentSources.find(source => source.id === join.leftSourceId)
        const leftColumn = leftSource?.columns.find(column => column.name === join.leftOn)
        const rightSource = allSources.find(source => source.id === join.rightSourceId)
        const rightColumn = rightSource?.columns.find(column => column.name === join.rightOn)
        const rightSources = rightSource ? [...availableSources, rightSource] : availableSources
        const leftSources = currentSources.filter(source => source.id !== join.rightSourceId)
        return (
          <React.Fragment key={`${join.leftSourceId}${join.rightSourceId}${index}`}>
            <Cell span={4}>
              <SourceSelector
                sources={leftSources}
                value={leftSource}
                onChange={source => updateJoinAtIndex(index, 'leftSourceId', source.id)}
              />
              <Stack direction="row" spacing={1} paddingTop={2} alignItems={'center'}>
                <IndentArrow />
                <ColumnSelect
                  columns={(leftSource?.columns || []) as ColumnSchema[]}
                  value={leftColumn as ColumnSchema}
                  onChange={column => updateJoinAtIndex(index, 'leftOn', column.name)}
                />
              </Stack>
            </Cell>
            <Cell span={4}>
              <SourceSelector
                sources={rightSources}
                value={rightSources.find(source => source.id === join.rightSourceId)}
                onChange={source => updateJoinAtIndex(index, 'rightSourceId', source.id)}
              />
              <Stack direction="row" spacing={1} paddingTop={2} alignItems={'center'}>
                <IndentArrow />
                <ColumnSelect
                  disabled={false}
                  columns={(rightSource?.columns || []) as ColumnSchema[]}
                  value={rightColumn as ColumnSchema}
                  onChange={column => updateJoinAtIndex(index, 'rightOn', column.name)}
                />
              </Stack>
            </Cell>
            <Cell span={3}>
                <JoinTypeSelector
                  join={join}
                  onChange={operator => updateJoinAtIndex(index, 'operator', operator)}
                  />
            </Cell>
            <Cell span={1}>
              <IconButton
                icon={<TrashIcon />}
                label="Delete Join"
                onClick={() => removeJoinAtIndex(index)}
              />
            </Cell>
          </React.Fragment>
        )
      })}
      <Cell span={12}>
        <ButtonPrimary onClick={addJoin}>Add Join</ButtonPrimary>
      </Cell>
    </NoPaddingGrid>
  )
}
