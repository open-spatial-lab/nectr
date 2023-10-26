import React, { useEffect, useRef } from 'react'
import { Cell } from '@webiny/ui/Grid'
import { MetaColumnSchema, SourceMeta } from '../QueryBuilder/types'
import { List, ListItem, ListItemText, ListItemTextSecondary, ListItemMeta } from '@webiny/ui/List'
import { NoPaddingGrid } from '../SplitView'
import { IconButton } from '@webiny/ui/Button'
import { ReactComponent as AddIcon } from '../../assets/add.svg'
import { ReactComponent as CalculatorIcon } from '../../assets/calculator.svg'
import { FormControl, FormControlLabel, Stack, Switch } from '@mui/material'
import { FieldCalculatorDialog } from './FieldCalcualtorDialog'
import { ColumnRow } from './ColumnRow'

const getColName = (col: MetaColumnSchema) =>
  col.alias ? col.alias : col.aggregate ? `${col.aggregate}_${col.name}` : col.name

export const ColumnSelector: React.FC<{
  sources: SourceMeta[]
  onChange: (columns: Array<MetaColumnSchema>) => void
  currentColumns: Array<MetaColumnSchema>
  simple?: boolean
  isNested?: boolean
  hideCurrent?: boolean
  hideAdvanced?: boolean
}> = ({ sources, onChange, currentColumns, simple, isNested, hideCurrent, hideAdvanced }) => {
  const startedSimple = useRef(simple)
  const [simpleView, setSimpleView] = React.useState(simple)
  const [fieldCalculatorOpen, setFieldCalculatorOpen] = React.useState(false)
  const toggleFieldCalculator = () => setFieldCalculatorOpen(s => !s)
  const resetFieldCalculator = () => setFieldCalculatorInfo(null)
  const [currentSource, setCurrentSource] = React.useState<SourceMeta | null>(sources?.[0] || null)
  const [fieldCalculatorInfo, setFieldCalculatorInfo] = React.useState<{
    expression: string
    columnName: string
    index: number
  } | null>(null)


  const currentSourceColumns = currentSource?.columns || []
  const sourceIds = sources?.map(source => source.id) || []
  const columnWidth = simpleView || (!simpleView && hideCurrent) ? 6 : 4

  const handleRemoveColumnAtIndex = (index: number) => {
    const newColumns = currentColumns.filter((col, idx) => idx !== index)
    onChange(newColumns)
  }

  const handleFilterColumns = () => {
    if (!currentColumns) {
      return
    }
    const filteredColumns = currentColumns.filter(col => sourceIds.includes(col.sourceId))
    onChange(filteredColumns)
  }

  const handleColumnPropertyAtIndex = <T extends keyof MetaColumnSchema>(
    index: number,
    property: T,
    value: MetaColumnSchema[T]
  ) => {
    currentColumns[index][property] = value
    onChange(currentColumns)
  }

  const handleUpdateAtIndex = (index: number, column: MetaColumnSchema) => {
    currentColumns[index] = column
    onChange(currentColumns)
  }
  const getHandleUpdateAtIndex = (index: number) => (column: MetaColumnSchema) => {
    handleUpdateAtIndex(index, column)
  }

  useEffect(() => {
    if (sources.length === 1) {
      setCurrentSource(sources[0])
    }
    handleFilterColumns()
  }, [JSON.stringify(sourceIds)])

  if (!currentSource) {
    return null
  }

  const handleAddColumn = (column: MetaColumnSchema, includeExpression = false) => {
    const name = getColName(column)
    // @ts-ignore
    const metaSchema: MetaColumnSchema = {
      name,
      sourceId: currentSource.id,
      sourceTitle: currentSource.title,
      expression: includeExpression ? column.expression : undefined,
      alias: column.alias,
    }
    const duplicateColumns = currentColumns.filter(
      col => col.name === metaSchema.name && col.sourceId === metaSchema.sourceId
    )
    if (duplicateColumns.length > 0) {
      let counter = 1
      while (!metaSchema.alias) {
        const aliasExists = currentColumns.find(col => col.alias === `${column.name}_${counter}`)
        if (!aliasExists) {
          metaSchema.alias = `${column.name}_${counter}`
        }
        counter++
      }
    }
    onChange([...currentColumns, metaSchema])
  }

  return (
    <NoPaddingGrid>
      {!simpleView && (
        <Cell span={columnWidth}>
          <List>
            <ListItem style={{ fontWeight: 'bold', pointerEvents: 'none' }}>
              <ListItemText>Data Sources</ListItemText>
            </ListItem>
            {sources.map((source, idx) => (
              <ListItem
                key={`${source?.id}${idx}`}
                style={{
                  borderBottom: '1px solid rgba(0,0,0,0.5)',
                  backgroundColor:
                    currentSource?.id === source?.id ? 'var(--highlighted)' : 'transparent'
                }}
                onClick={() => setCurrentSource(source)}
              >
                <ListItemText>{source.title}</ListItemText>
              </ListItem>
            ))}
          </List>
        </Cell>
      )}
      <Cell span={columnWidth}>
        <List>
          <ListItem style={{ fontWeight: 'bold', pointerEvents: 'none' }}>
            <ListItemText>{currentSource.title} Columns</ListItemText>
          </ListItem>
          <div style={{ height: '30vh', overflowY: 'auto' }}>
            {currentSourceColumns.map((column, idx) => (
              <ListItem
                key={`${column?.name}${idx}`}
                style={{ paddingTop: '.5rem', paddingBottom: '.5rem' }}
              >
                <ListItemText>
                  {getColName(column as MetaColumnSchema)}
                  <ListItemTextSecondary>{column.description}</ListItemTextSecondary>
                </ListItemText>
                <ListItemMeta>
                  <IconButton
                    icon={<AddIcon />}
                    label={`Add ${column.name} to data view`}
                    onClick={() => handleAddColumn(column as MetaColumnSchema)}
                  />
                </ListItemMeta>
              </ListItem>
            ))}
          </div>
        </List>
      </Cell>
      {!hideCurrent && (
        <Cell span={columnWidth}>
          {currentColumns.length === 0 ? (
            <p
              style={{
                padding: '1rem',
                background: 'rgba(0,0,0,0.1)',
                marginTop: '1rem'
              }}
            >
              <i>
                Choose a dataset on the left column, then choose a column to add to your data view.
              </i>
            </p>
          ) : (
            <List>
              <ListItem style={{ fontWeight: 'bold', pointerEvents: 'none' }}>
                <ListItemText>Data View Columns</ListItemText>
              </ListItem>
              <div style={{ height: '30vh', overflowY: 'auto' }}>
                {currentColumns.map((column, idx) => (
                  <ColumnRow
                    key={`${column?.name}${idx}`}
                    column={column}
                    idx={idx}
                    onRemove={handleRemoveColumnAtIndex}
                    onChange={handleColumnPropertyAtIndex}
                    simple={simpleView}
                    setShowFieldCalculator={() => setFieldCalculatorOpen(true)}
                    setFieldCalculatorInfo={(v: MetaColumnSchema) =>
                      setFieldCalculatorInfo({
                        // @ts-ignore
                        expression: v.expression,
                        columnName: v.name,
                        index: idx
                      })
                    }
                  />
                ))}
              </div>
            </List>
          )}
        </Cell>
      )}
      {!hideAdvanced && (
        <Cell span={12}>
          <Stack direction="row" width="100%">
            {Boolean(startedSimple) && (
              <FormControl component="fieldset" variant="standard">
                <FormControlLabel
                  control={
                    <Switch
                      checked={!simpleView}
                      onChange={() => setSimpleView(s => !s)}
                      title="Show Advanced Features"
                    />
                  }
                  label="Show Advanced Features"
                />
              </FormControl>
            )}
            {!simpleView && (
              <div style={{ marginLeft: 'auto' }}>
                <IconButton
                  icon={<CalculatorIcon />}
                  label="Field Calculator"
                  onClick={toggleFieldCalculator}
                />
              </div>
            )}
          </Stack>
        </Cell>
      )}
      {Boolean(!isNested && fieldCalculatorOpen) && (
        <FieldCalculatorDialog
          sources={sources}
          onAdd={
            fieldCalculatorInfo?.index !== undefined
              ? getHandleUpdateAtIndex(fieldCalculatorInfo.index)
              : (col: any) => handleAddColumn(col, true)
          }
          onClose={() => {toggleFieldCalculator();resetFieldCalculator()}}
          initialColumnName={fieldCalculatorInfo?.columnName}
          initialExpression={fieldCalculatorInfo?.expression}
        />
      )}
    </NoPaddingGrid>
  )
}
