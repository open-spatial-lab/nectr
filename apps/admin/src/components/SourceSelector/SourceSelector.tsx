import React from "react";
import { SourceSelectorProps } from "./types";
import { Select, FormControl, InputLabel, MenuItem } from "@mui/material";
import { SourceMeta } from "../QueryBuilder/types";

export const SourceSelector = ({ sources, onChange, value, label="Select a source" }: SourceSelectorProps) => {
    return (
        <FormControl fullWidth variant="filled">
            <InputLabel id="demo-simple-select-label">{label}</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={value?.id || ''}
                label={label || "Select a source"}
                onChange={e => {
                    const id = e.target.value as SourceMeta["id"];
                    const source = sources.find(source => source.id === id);
                    source && onChange(source);
                }}
            >
                {sources.map(source => (
                    <MenuItem key={source.id} value={source.id}>{source.title}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
