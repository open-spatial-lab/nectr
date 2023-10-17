import { ColumnSelectProps } from './types'
import React, { useRef } from 'react'
import { FormControl, MenuItem, Autocomplete, TextField } from '@mui/material'
import { ColumnSchema } from '../../plugins/scaffolds/dataUploads/types'

export const ColumnSelect = ({
  columns,
  onChange,
  value,
  disabled,
  label = 'Select a column',
  multi = false
}: ColumnSelectProps) => {
  const randomId = useRef(Math.random().toString(36).substring(7))
  // @ts-ignore
  const cleanValue = value === "None" ? [] : value
  const selectedValue = multi ? cleanValue : cleanValue[0]

  return (
    <FormControl
      fullWidth
      sx={{
        marginTop: '1rem',
        marginBottom: '1rem'
      }}
      variant="filled"
    >
      <Autocomplete
        id={`${randomId}-simple-select`}
        multiple={multi}
        disabled={disabled}
        value={selectedValue}

        onChange={(_e, _val) => {
          if (_val === null || !Boolean(_val)){
            return 
          }
          const val = Array.isArray(_val) ? _val : [_val as ColumnSchema]
          onChange(val)
        }}
        getOptionLabel={o => o.name}
        options={columns}
        renderOption={(props, option) => (
          <MenuItem {...props} key={option.name} value={option.name}>
            {option.name}
          </MenuItem>
        )}
        renderInput={params => <TextField {...params} label={label} />}
      />
    </FormControl>
  )
}
