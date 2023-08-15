import React from 'react'
import { Select, FormControl, InputLabel, MenuItem } from '@mui/material'
import { ColumnSelectProps } from './types'
import { ColumnSchema } from '../QueryBuilder/types'

export const ColumnSelect = ({
  columns,
  onChange,
  value,
  disabled,
  children,
  label = 'Select a column'
}: ColumnSelectProps) => {
  return (
    <FormControl
      fullWidth
      sx={{
        marginTop: '1rem',
        marginBottom: '1rem'
      }}
      variant="filled"
    >
      <InputLabel id="demo-simple-select-label">{label}</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        label={label}
        disabled={disabled}
        value={value?.name || ''}
        onChange={e => {
          const id = e.target.value as ColumnSchema['name']
          const column = columns.find(column => column.name === id)
          column && onChange(column)
        }}
      >
        {children}
        {columns.map(column => (
          <MenuItem key={column.name} value={column.name}>
            {column.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
