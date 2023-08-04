import React from "react";
import { WhereQuery } from "../QueryBuilder";
import { OPERATORS, OPERATOR_TYPES, SourceMeta } from "../QueryBuilder/types";
import {
    Chip,
    FormControl,
    FormControlLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    InputLabel
} from "@mui/material";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import { ColumnExplorer } from "../ColumnSelector";
import { NoPaddingGrid } from "../SplitView";
import { Cell } from "@webiny/ui/Grid";
import { operatorConfig } from "./operatorConfig";
export const WhereBuilder: React.FC<{
    currentSources: SourceMeta[];
    wheres: WhereQuery[];
    onChange: (value: WhereQuery[]) => void;
}> = ({ currentSources, wheres, onChange }) => {
    const [openWhereDialogIndex, setOpenWhereDialogIndex] = React.useState<number>(-1);
    const handleWhereChangeAtIndex = <T extends keyof WhereQuery>(
        index: number,
        property: T,
        value: WhereQuery[T]
    ) => {
        wheres[index][property] = value;
        onChange([...wheres]);
    };
    const removeWhereAtIndex = (index: number) => {
        wheres.splice(index, 1);
        onChange([...wheres]);
    };
    const addWhere = () => {
        onChange([
            ...wheres,
            {
                sourceId: currentSources[0].id,
                column: currentSources[0].columns[0].name,
                operator: OPERATORS[0],
                value: undefined
            } as WhereQuery
        ]);
    };
    const openWhereConfig = wheres[openWhereDialogIndex];
    return (
        <div>
            {wheres.map((where, index) => (
                <Chip
                    key={index}
                    label={`${where.column} ${where.operator} ${where.value || ""}`}
                    onClick={() => setOpenWhereDialogIndex(index)}
                    onDelete={() => removeWhereAtIndex(index)}
                />
            ))}
            <Chip
                label="Add New Filter"
                component="a"
                href="#basic-chip"
                variant="outlined"
                clickable
                onClick={addWhere}
            />
            {!!openWhereConfig && (
                <WhereDialog
                    where={openWhereConfig}
                    currentSources={currentSources}
                    onChange={(prop, val) =>
                        handleWhereChangeAtIndex(openWhereDialogIndex, prop, val)
                    }
                    onClose={() => setOpenWhereDialogIndex(-1)}
                />
            )}
        </div>
    );
};

export const WhereDialog: React.FC<{
    where: WhereQuery;
    currentSources: SourceMeta[];
    onChange: <T extends keyof WhereQuery>(property: T, value: WhereQuery[T]) => void;
    onClose: () => void;
}> = ({ where, currentSources, onChange, onClose }) => {
    return (
        <Dialog onClose={onClose} open={true} fullWidth maxWidth="lg">
            <DialogTitle>Configure Data Filter</DialogTitle>
            {/* column */}
            <NoPaddingGrid style={{ padding: "1rem", width: "100%" }}>
                <Cell span={8}>
                    <ColumnExplorer
                        sources={currentSources}
                        onClick={(column, source) => {
                            onChange("column", column.name);
                            source && onChange("sourceId", source.id);
                        }}
                        currentColumn={where.column}
                        currentSourceId={where.sourceId}
                    />
                </Cell>
                {/* operation */}
                {/* default */}
                <Cell span={4}>
                    <FormControl fullWidth variant="filled">
                        <InputLabel id="demo-simple-select-label">Filter Type</InputLabel>
                        <Select
                            value={where.operator}
                            label={"Filter Type"}
                            onChange={e => {
                                onChange("operator", e.target.value as OPERATOR_TYPES);
                                onChange("value", undefined);
                            }}
                        >
                            {OPERATORS.map((op, idx) => (
                                <MenuItem key={idx} value={op}>
                                    {operatorConfig[op]?.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <hr style={{ margin: "1rem 0 " }} />
                    <TextField
                        fullWidth
                        variant="filled"
                        value={where.value || ""}
                        label={"Default Filter Value"}
                        // @ts-ignore
                        onChange={e => onChange("value", e.target.value)}
                    />
                </Cell>
                {/* allow custom */}
                {/* alias */}
                <Cell span={12}>
                    <hr />
                    <p>Advanced</p>
                </Cell>
                <Cell span={3}>
                    <FormControl>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={where.allowCustom}
                                    onChange={() => onChange("allowCustom", !where.allowCustom)}
                                />
                            }
                            label="Allow Custom Query Values"
                        />
                    </FormControl>
                </Cell>
                <Cell span={6}>
                    <TextField
                        fullWidth
                        variant="filled"
                        disabled={!where.allowCustom}
                        label="Custom Query Value Alias"
                        value={where.customAlias || ""}
                        required={where.allowCustom}
                        // @ts-ignore
                        onChange={e => onChange("customAlias", e.target.value)}
                    />
                </Cell>
            </NoPaddingGrid>
        </Dialog>
    );
};
