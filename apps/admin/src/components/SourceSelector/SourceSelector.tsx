import React from "react"
import { SourceSelectorProps } from "./types"
import { FormControl, MenuItem, Autocomplete, TextField } from "@mui/material"
import { SourceMeta } from "../QueryBuilder/types"
import Stack from "@mui/material/Stack"
import SourceMetaView from "../SourceMetaView"

export const SourceSelector = ({
  sources,
  onChange,
  value,
  label = "Select a source",
  showMeta = true,
  disabled = false,
  showDerived = false,
}: SourceSelectorProps) => {
  const cleanedSources = showDerived
    ? sources
    : sources.filter((s) => s.id !== "derived")

  const cleanedSourceTypes = cleanedSources.map((s) => ({
    ...s,
    groupLabel: s.__typename === "Dataset" ? "Dataset" : "Data View",
  })) as SourceMeta[]

  const sortedSources = cleanedSourceTypes.sort(
    (a, b) =>
      //  sort by title and by __typename
      a.__typename.localeCompare(b.__typename) || a.title.localeCompare(b.title)
  )
  const source =
    value !== undefined
      ? sortedSources.find((s) => s.id === value.id)
      : undefined

  if (!sources.length) {
    return null
  }
  
  return (
    <FormControl fullWidth variant="filled">
      <Stack direction={"row"} spacing={0}>
        <FormControl
          fullWidth
          sx={{
            marginTop: "1rem",
            marginBottom: "1rem",
          }}
          variant="filled"
        >
          <Autocomplete
            multiple={false}
            disabled={disabled}
            value={source}
            onChange={(_e, source) => {
              source && onChange(source)
            }}
            // @ts-ignore
            groupBy={(option) => option.groupLabel}
            getOptionLabel={(o) => o?.title}
            options={sortedSources || []}
            renderOption={(props, option) => (
              <MenuItem {...props} key={option.id} value={option.id}>
                {option.title}
              </MenuItem>
            )}
            renderInput={(params) => (
              <Stack direction="row">
                <TextField {...params} label={label} size="small" />
                {showMeta && value !== undefined && (
                  <SourceMetaView source={source} />
                )}
              </Stack>
            )}
          />
        </FormControl>
      </Stack>
    </FormControl>
  )
}
