import React, { useEffect } from "react";
import { QueryBuilderProps, SelectQuery, WhereQuery } from "./types";
import { Select } from "@webiny/ui/Select";
import { ButtonDefault as Button, ButtonPrimary } from "@webiny/ui/Button";
import { Grid, Cell } from "@webiny/ui/Grid";
import { Input } from "@webiny/ui/Input";
import { Chips, Chip } from "@webiny/ui/Chips";
import { Checkbox } from "@webiny/ui/Checkbox";
import { Dialog, DialogContent } from "@webiny/ui/Dialog";

const onlyUnique = (value: any, index: number, self: any) => {
    return self.indexOf(value) === index;
};

const operatorConfig: {
    [key: string]: {
        label: string;
        inputs: ("text" | "number" | "chips")[];
        explanation: string;
    };
} = {
    "=": {
        label: "Equals",
        inputs: ["text"],
        explanation: "a number or text"
    },
    "!=": {
        label: "Not Equals",
        inputs: ["text"],
        explanation: "a number or text"
    },
    ">": {
        label: "Greater than",
        inputs: ["number"],
        explanation: "a number"
    },
    ">=": {
        label: "Greater than or equal to",
        inputs: ["number"],
        explanation: "a number"
    },
    "<": {
        label: "Less than",
        inputs: ["number"],
        explanation: "a number"
    },
    "<=": {
        label: "Less than or equal to",
        inputs: ["number"],
        explanation: "a number"
    },
    In: {
        label: "One of",
        inputs: ["chips"],
        explanation: "a list of numbers of text, separated by commas (eg. value=1,2,3)"
    },
    NotIn: {
        label: "Not one of",
        inputs: ["chips"],
        explanation: "a list of numbers of text, separated by commas (eg. value=1,2,3)"
    },
    Null: {
        label: "Missing",
        inputs: [],
        explanation: ""
    },
    NotNull: {
        label: "Not Missing",
        inputs: [],
        explanation: ""
    },
    //   // "Exists": {
    //     label: "",
    //     inputs:[]

    //   },
    //   // "NotExists": {
    //     label: "",
    //     inputs:[]

    //   },
    Between: {
        label: "Between",
        inputs: ["number", "number"],
        explanation: "two numbers separated by a comma (eg. value=1,2)"
    },
    NotBetween: {
        label: "Not Between",
        inputs: ["number", "number"],
        explanation: "two numbers separated by a comma (eg. value=1,2)"
    },
    Like: {
        label: "Contains",
        inputs: ["text"],
        explanation: "text"
    },
    ILike: {
        label: "Contains (case insensitive)",
        inputs: ["text"],
        explanation: "text"
    },
    NotLike: {
        label: "Does not contain",
        inputs: ["text"],
        explanation: "text"
    },
    NotILike: {
        label: "Does not contain (case insensitive)",
        inputs: ["text"],
        explanation: "text"
    }
};

export type WhereBuilderInput = {
    type: "text" | "number" | "chips";
    value: string | number | string[];
    handleInputChange: (action: "add" | "remove" | "update", value?: any) => void;
};

export type HandleWhereChangeArgs = {
    action: "add" | "remove" | "update";
    index?: number;
    key?: string;
    value?: any;
};

const WhereParamInput: React.FC<WhereBuilderInput> = ({ type, value, handleInputChange }) => {
    const [inputText, setInputText] = React.useState<string>("");
    useEffect(() => {
        if (type === "chips" && ((value || []) as string[]).includes(inputText)) {
            setInputText("");
        }
    }, [JSON.stringify(value)]);
    switch (type) {
        case "text":
            return (
                <Input
                    type="text"
                    value={value as string}
                    onChange={value => handleInputChange("update", value)}
                />
            );
        case "number":
            return (
                <Input
                    type="number"
                    value={value as number}
                    onChange={value => handleInputChange("update", value)}
                />
            );
        case "chips":
            const handleRemoveChip = (removeValue: string) => {
                const newValue = Array.isArray(value)
                    ? value.filter((v: string) => v !== removeValue)
                    : [];

                handleInputChange("update", newValue);
            };
            const chips = (value || []) as string[];

            return (
                <div>
                    {!!chips.length && (
                        <Chips>
                            {((value || []) as string[]).map((v, i) => (
                                <Chip
                                    key={i}
                                    label={<span>{v} &times;</span>}
                                    // @ts-ignore
                                    onClick={() => handleRemoveChip(v)}
                                />
                            ))}
                        </Chips>
                    )}
                    <Input
                        type="text"
                        value={inputText}
                        placeholder="Add a new option"
                        // @ts-ignore
                        onKeyPress={e => {
                            const event = e as any;
                            const key = event.key;
                            const value = event?.target?.value;
                            if (key === "Enter" && value.length) {
                                handleInputChange("add", value);
                            }
                        }}
                        onChange={value => setInputText(value)}
                    />
                </div>
            );
        default:
            return null;
    }
};

const WhereBuilderRow: React.FC<{
    clause: WhereQuery;
    index: number;
    handleWhereChange: (args: HandleWhereChangeArgs) => void;
}> = ({ clause, index, handleWhereChange }) => {
    const inputs = operatorConfig[clause.operator].inputs;
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const toggleDialog = () => setDialogOpen(p => !p);

    if (!inputs?.length) {
        return null;
    }
    const getHandleInputchange =
        (entryIndex: number) => (action: "remove" | "update" | "add", value: string | number) => {
            switch (action) {
                case "remove":
                    if (Array.isArray(value)) {
                        handleWhereChange({
                            action: "update",
                            index: index,
                            key: "value",
                            value: ((value as string[]) || []).filter(
                                (v: string | number) => v !== value
                            )
                        });
                    }
                    break;
                case "update": {
                    const newValue = [...clause.value];
                    newValue[entryIndex] = value;
                    handleWhereChange({
                        action: "update",
                        index: index,
                        key: "value",
                        value: newValue
                    });
                    break;
                }
                case "add": {
                    const oldValues = Array.isArray(clause.value[0]) ? clause.value[0] : [];
                    const newValue = [...oldValues, value];
                    handleWhereChange({
                        action: "update",
                        index: index,
                        key: "value",
                        value: [newValue.filter(onlyUnique)]
                    });
                    break;
                }
                default:
                    break;
            }
        };
    return (
        <React.Fragment>
            {inputs.map((input, entryIndex) => {
                const columns = input === "chips" || inputs.length === 1 ? 4 : 2;
                return (
                    <Cell span={columns} tablet={columns} desktop={columns} key={entryIndex}>
                        <WhereParamInput
                            key={entryIndex}
                            type={input}
                            value={clause.value[entryIndex]}
                            handleInputChange={getHandleInputchange(entryIndex)}
                        />
                    </Cell>
                );
            })}
            <Cell span={1}>
                <Button onClick={toggleDialog}>...</Button>
            </Cell>
            <Cell span={1}>
                <Button
                    onClick={() => {
                        handleWhereChange({ action: "remove", index: index });
                    }}
                >
                    &times;
                </Button>
                <Dialog open={dialogOpen} onClose={toggleDialog}>
                    <DialogContent>
                        <h3>Advanced settings</h3>
                        <Checkbox
                            onClick={() => {
                                handleWhereChange({
                                    action: "update",
                                    index: index,
                                    key: "allowCustom",
                                    value: !clause.allowCustom
                                });
                            }}
                            label={"Allow custom API values"}
                            description={
                                "Allow data users to override your values with custom values. This may incur additional costs if large data queries are executed."
                            }
                            value={clause.allowCustom}
                        />
                        <br />
                        <p>You may provide a custom name. For more read docs here...[todo]</p>
                        <br />
                        <p>
                            To use a custom query values, data users should provide a URL query
                            parameter for{" "}
                            <u>
                                {clause.customAlias
                                    ? clause.customAlias
                                    : `${clause.column}${index + 1}`}
                            </u>
                            .
                            <br />
                            <br />
                            {operatorConfig[clause.operator].explanation.length > 0 && (
                                <span>
                                    Your data users should provide{" "}
                                    {operatorConfig[clause.operator].explanation} to change this
                                    data filter.
                                </span>
                            )}
                        </p>
                        <Input
                            type="text"
                            value={clause.customAlias}
                            disabled={!clause.allowCustom}
                            onChange={value => {
                                handleWhereChange({
                                    action: "update",
                                    index: index,
                                    key: "customAlias",
                                    value: value
                                });
                            }}
                            placeholder="Custom alias"
                        />
                    </DialogContent>
                </Dialog>
                {/* <Menu handle={<ButtonPrimary>...</ButtonPrimary>}>
                    <MenuItem onClick={() => handleWhereChange({ action: "remove", index: index })}>
                    &times; Remove
                    </MenuItem>
                    <MenuItem><input type="text"/></MenuItem>
                </Menu> */}
            </Cell>
        </React.Fragment>
    );
};

const WhereBuilder: React.FC<{
    template: SelectQuery;
    handleTemplateChange: (key: keyof SelectQuery, value: SelectQuery[keyof SelectQuery]) => void;
    columns: string[];
}> = ({ template, handleTemplateChange, columns }) => {
    const handleWhereChange = ({ action, index, key, value }: HandleWhereChangeArgs) => {
        switch (action) {
            case "add":
                handleTemplateChange("where", [
                    ...(template.where || []),
                    {
                        column: "",
                        operator: "=",
                        value: [""]
                    }
                ] as WhereQuery[]);
                break;
            case "remove":
                handleTemplateChange(
                    "where",
                    (template.where || []).filter((_, i) => i !== index)
                );
                break;
            case "update":
                if (index == undefined || key === undefined || !template?.where?.[index]) {
                    return;
                }
                const clause = {
                    ...template.where[index],
                    [key]: value
                };
                const newWhereTemplate = template.where.map((item, i) =>
                    i === index ? clause : item
                );
                handleTemplateChange("where", newWhereTemplate);
                break;
            default:
                break;
        }
    };
    return (
        <div>
            {template.where?.map((clause, index) => (
                <Grid key={index}>
                    <Cell span={3} desktop={3} tablet={3}>
                        <Select
                            label={"Column"}
                            description={"Choose your column"}
                            value={clause.column}
                            options={columns}
                            onChange={val =>
                                handleWhereChange({
                                    action: "update",
                                    index,
                                    key: "column",
                                    value: val
                                })
                            }
                        />
                    </Cell>
                    <Cell span={3} desktop={3} tablet={6}>
                        <Select
                            label={"Constraint"}
                            description={"Choose a constraint"}
                            value={operatorConfig[clause.operator]?.label}
                            options={Object.values(operatorConfig).map(item => item.label)}
                            onChange={val =>
                                handleWhereChange({
                                    action: "update",
                                    index,
                                    key: "operator",
                                    value: Object.entries(operatorConfig).find(
                                        ([, value]) => value.label === val
                                    )?.[0]
                                })
                            }
                        />
                    </Cell>

                    <WhereBuilderRow
                        clause={clause}
                        index={index}
                        handleWhereChange={handleWhereChange}
                    />
                </Grid>
            ))}
            <Button onClick={() => handleWhereChange({ action: "add" })}>Add New Filter</Button>
        </div>
    );
};

const ColumnSelector: React.FC<{
    template: SelectQuery;
    handleTemplateChange: (key: keyof SelectQuery, value: SelectQuery[keyof SelectQuery]) => void;
    columns: string[];
}> = ({ template, handleTemplateChange, columns }) => {
    const handleToggleColumn = (column: string) => {
        if (template.columns?.includes(column)) {
            handleTemplateChange(
                "columns",
                (template.columns || []).filter(item => item !== column)
            );
        } else {
            handleTemplateChange("columns", [...(template.columns || []), column]);
        }
    };
    const addedColumns = template.columns || [];
    const availableColumns = columns.filter(col => !addedColumns.includes(col));
    return (
        <div>
            <Grid>
                <Cell span={6} desktop={6} tablet={6}>
                    <p>Columns in your dataset</p>
                    {availableColumns.map(col => (
                        <Button onClick={() => handleToggleColumn(col)} small key={col}>
                            {col}
                        </Button>
                    ))}
                    <br />
                </Cell>

                <Cell span={6} desktop={6} tablet={6}>
                    <p>Included columns in data view</p>
                    {addedColumns.length === 0 && (
                        <p>
                            <br />
                            <br />
                            <i>
                                If you don&apos;t select any columns, <u>all</u> columns will
                                automatically be included.
                            </i>
                        </p>
                    )}
                    {addedColumns.map(col => (
                        <Button onClick={() => handleToggleColumn(col)} small key={col}>
                            {col}
                        </Button>
                    ))}
                    <br />
                </Cell>
            </Grid>
        </div>
    );
};

const getColumns = async (file: string) => {
    if (!file) {
        return [];
    }
    const response = await fetch(`https://d2vloi59ojgfpi.cloudfront.net/data-query/id`, {
        method: "POST",
        body: JSON.stringify({
            query: `SELECT * FROM 's3://wby-fm-bucket-dd131b3/${file}' LIMIT 1`
        })
    }).then(r => (r.ok ? r.json() : [{}]));
    return Object.keys(response[0]);
};

export const QueryBuilder: React.FC<QueryBuilderProps> = ({
    files,
    template,
    onChangeTemplate,
}) => {
    const [availableColumns, setAvailableColumns] = React.useState<string[]>([]);
    const selectedFile = files.find(f => f.key === template.from);

    const handleTemplateChange = <T extends keyof SelectQuery>(key: T | T[], value: SelectQuery[T] | SelectQuery[T][]) => {
        if (Array.isArray(key) && Array.isArray(value)) {
            const newTemplate: SelectQuery = {
                ...template
            }
            key.forEach((key, i) => {
                // @ts-ignore
                newTemplate[key] = value[i] 
            })
            onChangeTemplate(JSON.stringify(newTemplate))
        } else if (typeof key === "string" && typeof value !== "undefined"){
            onChangeTemplate(
                JSON.stringify({
                    ...template,
                    [key]: value
                })
            );
        }
    };

    const handleChangeWhereOperator = (operator: "and" | "or") => {
        onChangeTemplate(
            JSON.stringify({
                ...template,
                combinedOperator: operator
            })
        );
    };

    useEffect(() => {
        getColumns(template.from).then(columns => setAvailableColumns(columns));
    }, [template.from]);

    const AndButton = template.combinedOperator === "or" ? Button : ButtonPrimary;
    const OrButton = template.combinedOperator !== "or" ? Button : ButtonPrimary;

    return (
        <div>
            <h4>Query Builder</h4>
            <br />
            <Select
                label={"Choose your dataset"}
                description={"Choose your dataset"}
                value={selectedFile?.name}
                options={files.map(f => f.name)}
                onChange={val => {
                    const newValue = files.find(f => f.name === val)?.key;
                    handleTemplateChange(["from",'fromS3'], [newValue, true])
                }}
            />
            {template?.from?.length && (
                <>
                    <ColumnSelector
                        template={template}
                        handleTemplateChange={handleTemplateChange}
                        columns={availableColumns}
                    />
                    <Grid>
                        <Cell span={6} desktop={6} tablet={6}>
                            <p>Data Filters</p>
                        </Cell>
                        <Cell span={6} desktop={6} tablet={6}>
                            <AndButton onClick={() => handleChangeWhereOperator("and")}>
                                All of thse
                            </AndButton>
                            <OrButton onClick={() => handleChangeWhereOperator("or")}>
                                Any of these
                            </OrButton>
                        </Cell>
                    </Grid>

                    <WhereBuilder
                        template={template}
                        handleTemplateChange={handleTemplateChange}
                        columns={
                            !template.columns || !template.columns.length
                                ? availableColumns
                                : template.columns
                        }
                    />
                </>
            )}
        </div>
    );
};
