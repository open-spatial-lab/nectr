import React from 'react'
import { Grid, Cell } from '@webiny/ui/Grid'
import {
  MetaColumnSchema,
  AGGREGATE_FUNCTION_TYPES,
  AGGREGATE_FUNCTIONS
} from '../QueryBuilder/types'
import {
  ListItem,
  ListItemText,
  ListItemGraphic,
  ListItemMeta
} from '@webiny/ui/List'
import { IconButton } from '@webiny/ui/Button'
import { ReactComponent as SettingsIcon } from '@webiny/app-admin/assets/icons/round-settings-24px.svg'
import { ReactComponent as TrashIcon } from '../../assets/trash.svg'
// close
import { ReactComponent as CloseIcon } from '../../assets/close.svg'
import { TextField } from '@mui/material'
import { Select } from '@webiny/ui/Select'
import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'

export const ColumnRow = ({
  column,
  idx,
  onRemove,
  onChange,
  simple,
  setShowFieldCalculator,
  setFieldCalculatorInfo
}: {
  column: MetaColumnSchema
  idx: number
  onRemove: (idx: number) => void
  onChange: <T extends keyof MetaColumnSchema>(
    index: number,
    property: T,
    value: MetaColumnSchema[T],
    ) => void,
    setShowFieldCalculator?: () => void,
    setFieldCalculatorInfo?: (v: MetaColumnSchema) => void
  simple?: boolean
}) => {
  const [showSettings, setShowSettings] = React.useState(false)

  const handleButtonClick = column.expression ? () => {
    setFieldCalculatorInfo && setFieldCalculatorInfo(column)
    setShowFieldCalculator && setShowFieldCalculator()
  } : () => setShowSettings(s => !s)
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
              onClick={handleButtonClick}
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
