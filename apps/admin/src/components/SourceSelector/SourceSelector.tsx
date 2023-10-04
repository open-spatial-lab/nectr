import React from 'react'
import { SourceSelectorProps } from './types'
import { Select, FormControl, InputLabel, MenuItem } from '@mui/material'
import { SourceMeta } from '../QueryBuilder/types'
import Stack from '@mui/material/Stack'
import SourceMetaView from '../SourceMetaView'

export const SourceSelector = ({
  sources,
  onChange,
  value,
  label = 'Select a source',
  showMeta = true,
  disabled=false
}: SourceSelectorProps) => {
  const source = value !== undefined ? sources.find(s => s.id === value?.id) : undefined
  return (
    <FormControl fullWidth variant="filled">
      <InputLabel id="demo-simple-select-label">{label}</InputLabel>
      <Stack direction={'row'} spacing={0}>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value?.id || ''}
          label={label || 'Select a source'}
          sx={{ flexGrow: 1, maxWidth: 'calc(100% - 64px)' }}
          disabled={disabled}
          onChange={e => {
            const id = e.target.value as SourceMeta['id']
            const source = sources.find(source => source.id === id)
            source && onChange(source)
          }}
        >
          {sources.map(source => (
            <MenuItem key={source.id} value={source.id}>
              {source.title}
            </MenuItem>
          ))}
        </Select>
        {showMeta && value !== undefined && (
          <SourceMetaView source={source} />
        )}
      </Stack>
    </FormControl>
  )
}
