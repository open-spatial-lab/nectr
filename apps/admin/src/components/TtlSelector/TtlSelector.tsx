import React from "react"
import { TtlSelectorProps } from "./types"

import TextField from "@mui/material/TextField"
import Stack from "@mui/material/Stack"

export const TtlSelector: React.FC<TtlSelectorProps> = ({
  value,
  onChange,
}) => {
  const days = Math.floor(value / 86400)
  const hours = Math.floor((value % 86400) / 3600)
  const minutes = Math.floor(((value % 86400) % 3600) / 60)

  const handleChange = ({
    _days,
    _hours,
    _minutes,
  }: {
    _days?: number
    _hours?: number
    _minutes?: number
  }) => {
    const daysNumber = (_days || days) * 86400
    const hoursNumber = (_hours || hours) * 3600
    const minutesNumber = (_minutes || minutes) * 60
    onChange(daysNumber + hoursNumber + minutesNumber)
  }

  return (
    <Stack direction="row" spacing={2}>
      <p>Save results for:</p>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Days"
          type="number"
          value={days}
          onChange={(e) => handleChange({ _days: parseInt(e.target.value) })}
          InputLabelProps={{
            shrink: true,
          }}
          variant="standard"
        />
        <TextField
          label="Hours"
          type="number"
          value={hours}
          onChange={(e) => handleChange({ _hours: parseInt(e.target.value) })}
          InputLabelProps={{
            shrink: true,
          }}
          variant="standard"
        />
        <TextField
          label="Minutes"
          type="number"
          value={minutes}
          onChange={(e) => handleChange({ _minutes: parseInt(e.target.value) })}
          InputLabelProps={{
            shrink: true,
          }}
          variant="standard"
        />
      </Stack>
    </Stack>
  )
}
