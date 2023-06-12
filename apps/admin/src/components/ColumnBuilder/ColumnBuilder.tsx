import React from "react";
import { ColumnBuilderProps, ColumnRowProps, ColumnTypeProps } from "./types";
import {
    ColumnSchema,
    DATA_COLUMN_TYPES,
    GEO_COLUMN_TYPES
} from "../QueryBuilder/types";
import { Grid, Cell } from "@webiny/ui/Grid";
import { Input } from "@webiny/ui/Input";
import { ButtonDefault } from "@webiny/ui/Button";
import { Tabs, Tab } from "@webiny/ui/Tabs";
import { Select } from "@webiny/ui/Select";

export const ColumnBuilder: React.FC<ColumnBuilderProps> = ({ columns, onChange }) => {
    const removeColumn = (index: number) => {
        const newColumns = [...columns];
        newColumns.splice(index, 1);
        onChange(newColumns);
    };
    const updateColumn = (index: number, column: ColumnSchema) => {
        const newColumns = [...columns];
        newColumns[index] = column;
        onChange(newColumns);
    };
    const numPages = Math.ceil(columns.length / 10);
    const pagesRange = Array.from(Array(numPages).keys());

    return (
        <Grid>
            {columns.length < 10 ? (
                <>
                    <Cell span={3}>
                        <p>Name</p>
                    </Cell>
                    <Cell span={2}>
                        <p>Type</p>
                    </Cell>
                    <Cell span={7}>
                        <p>Description</p>
                    </Cell>
                    {columns.map((column, index) => (
                        <ColumnRow
                            key={index}
                            column={column}
                            onChange={column => updateColumn(index, column)}
                            onDelete={() => removeColumn(index)}
                        />
                    ))}
                </>
            ) : (
                <Cell span={12}>
                    <p>Columns</p>
                    <Tabs>
                        {pagesRange.map(page => (
                            <Tab key={page} label={`${page*10 + 1}-${page*10 + 10}`}>
                                <Grid>
                                    <Cell span={3}>
                                        <p>Name</p>
                                    </Cell>
                                    <Cell span={2}>
                                        <p>Type</p>
                                    </Cell>
                                    <Cell span={7}>
                                        <p>Description</p>
                                    </Cell>
                                    {columns
                                        .slice(page * 10, page * 10 + 10)
                                        .map((column, index) => (
                                            <ColumnRow
                                                key={`${page}-${index}`}
                                                column={column}
                                                onChange={column => updateColumn(index+page*10, column)}
                                                onDelete={() => removeColumn(index+page*10)}
                                            />
                                        ))}
                                </Grid>
                            </Tab>
                        ))}
                    </Tabs>
                </Cell>
            )}
        </Grid>
    );
};

export const ColumnTypePicker: React.FC<ColumnTypeProps> = ({ type, onChange }) => {
    return (
        <Select value={type} onChange={onChange} label=" ">
            <optgroup label="Data">
                {DATA_COLUMN_TYPES.map(type => (
                    <option key={type} value={type}>
                        {type}
                    </option>
                ))}
            </optgroup>
            <optgroup label="Geospatial">
                {GEO_COLUMN_TYPES.map(type => (
                    <option key={type} value={type}>
                        {type}
                    </option>
                ))}
            </optgroup>
        </Select>
    );
};

export const ColumnRow: React.FC<ColumnRowProps> = ({ column, onChange, onDelete }) => {
    const { name, type, description } = column;

    return (
        <>
            <Cell span={3}>
                <Input value={name} disabled />
            </Cell>
            <Cell span={2}>
                <ColumnTypePicker
                    type={type}
                    onChange={type =>
                        onChange({
                            ...column,
                            type
                        })
                    }
                />
            </Cell>
            <Cell span={6}>
                <Input
                    // textarea
                    // rows={2}

                    value={description}
                    // defaultValue={description}
                    onChange={description =>
                        onChange({
                            ...column,
                            description
                        })
                    }
                />
            </Cell>
            <Cell span={1}>
                <ButtonDefault onClick={onDelete}>&times;</ButtonDefault>
            </Cell>
        </>
    );
};
