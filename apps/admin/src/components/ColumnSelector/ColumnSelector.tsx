import React, { useEffect } from 'react'
import { Grid, Cell } from '@webiny/ui/Grid'
import {
  MetaColumnSchema,
  // ColumnSchema,
  SourceMeta,
  AGGREGATE_FUNCTION_TYPES,
  AGGREGATE_FUNCTIONS
} from '../QueryBuilder/types'
import {
  List,
  ListItem,
  ListItemText,
  ListItemTextSecondary,
  ListItemGraphic,
  ListItemMeta
} from '@webiny/ui/List'
import { NoPaddingGrid } from '../SplitView'
import { IconButton } from '@webiny/ui/Button'
import { ReactComponent as SettingsIcon } from '@webiny/app-admin/assets/icons/round-settings-24px.svg'
import { ReactComponent as AddIcon } from '../../assets/add.svg'
import { ReactComponent as TrashIcon } from '../../assets/trash.svg'
// close
import { ReactComponent as CloseIcon } from '../../assets/close.svg'
import { TextField } from '@mui/material'
import { Select } from '@webiny/ui/Select'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'

const getColName = (col: MetaColumnSchema) => col.alias ? col.alias : col.aggregate ? `${col.aggregate}_${col.name}` : col.name
export const ColumnSelector: React.FC<{
  sources: SourceMeta[]
  onChange: (columns: Array<MetaColumnSchema>) => void
  currentColumns: Array<MetaColumnSchema>
  simple?: boolean
}> = ({ sources, onChange, currentColumns, simple }) => {
  const [currentSource, setCurrentSource] = React.useState<SourceMeta | null>(sources?.[0] || null)
  const currentSourceColumns = currentSource?.columns || []
  const sourceIds = sources?.map(source => source.id) || []
  const columnWidth = simple ? 6 : 4
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

  useEffect(() => {
    if (sources.length === 1) {
      setCurrentSource(sources[0])
    }
    handleFilterColumns()
  }, [JSON.stringify(sourceIds)])

  if (!currentSource) {
    return null
  }

  const handleAddColumn = (column: MetaColumnSchema) => {
    const name = getColName(column)
    // @ts-ignore
    const metaSchema: MetaColumnSchema = {
      name,
      sourceId: currentSource.id,
      sourceTitle: currentSource.title
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
      {!simple && (
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
                  simple={simple}
                />
              ))}
            </div>
          </List>
        )}
      </Cell>
    </NoPaddingGrid>
  )
}

const ColumnRow = ({
  column,
  idx,
  onRemove,
  onChange,
  simple
}: {
  column: MetaColumnSchema
  idx: number
  onRemove: (idx: number) => void
  onChange: <T extends keyof MetaColumnSchema>(
    index: number,
    property: T,
    value: MetaColumnSchema[T]
  ) => void
  simple?: boolean
}) => {
  const [showSettings, setShowSettings] = React.useState(false)
  return (
    <>
      <ListItem
        style={{
          paddingTop: showSettings ? '1rem' : '.25rem',
          paddingBottom: showSettings ? '1rem' : '0',
          transition: 'height .2s ease-in-out',
          height: 'auto',
          border: showSettings ? '1px solid rgba(0,0,0,0.5)' : 'none'
        }}
      >
        {!simple && (
          <ListItemGraphic>
            <IconButton
              icon={<SettingsIcon />}
              label="Show/Hide Settings"
              onClick={() => setShowSettings(s => !s)}
            />
          </ListItemGraphic>
        )}
        <ListItemText>
          {column?.name}{' '}
          {!!column?.alias && (
            <span style={{ color: 'gray', fontStyle: 'italic' }}>({column?.alias})</span>
          )}
        </ListItemText>
        <ListItemMeta>
          <IconButton icon={<TrashIcon />} label="Delete Column" onClick={() => onRemove(idx)} />
        </ListItemMeta>
      </ListItem>

      {showSettings && (
        <Dialog onClose={() => setShowSettings(false)} open={showSettings}>
          <DialogTitle>
            Configure {column?.name} Aggregate and Alias
            <div
              style={{
                position: 'absolute',
                top: '0',
                right: '0'
              }}
            >
              <IconButton icon={<CloseIcon />} onClick={() => setShowSettings(false)} />
            </div>
          </DialogTitle>

          <Grid>
            <Cell span={6}>
              <TextField
                label="Column Alias"
                value={column?.alias}
                onChange={e => onChange(idx, 'alias', e.currentTarget.value)}
              />
              <br />
              <br />
              <p>(Optional) An easier to interpret name for your data column.</p>
            </Cell>
            <Cell span={6}>
              <Select
                onChange={val => onChange(idx, 'aggregate', val as AGGREGATE_FUNCTION_TYPES)}
                label="Aggregate Function"
                value={column.aggregate || 'None'}
              >
                {[{ label: 'None', value: undefined }, ...AGGREGATE_FUNCTIONS].map(
                  ({ label, value }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  )
                )}
              </Select>
              <br />
              <p>
                (Optional) Generate a summary statistic about your column. Required in group and
                summarize data operations.
              </p>
            </Cell>
          </Grid>
        </Dialog>
      )}
    </>
  )
}
