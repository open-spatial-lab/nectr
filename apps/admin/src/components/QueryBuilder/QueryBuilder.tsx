import React, { useEffect } from "react";
import {
    AGGREGATE_FUNCTIONS,
    AGGREGATE_FUNCTION_TYPES,
    QueryBuilderProps,
    SelectQuery,
    WhereQuery
} from "./types";
import { Select } from "@webiny/ui/Select";
import { ButtonDefault as Button, ButtonPrimary } from "@webiny/ui/Button";
import { Grid, Cell } from "@webiny/ui/Grid";
import { Input } from "@webiny/ui/Input";
import { Chips, Chip } from "@webiny/ui/Chips";
import { Checkbox } from "@webiny/ui/Checkbox";
import { Dialog, DialogContent } from "@webiny/ui/Dialog";
import { ColumnSchema } from "../../plugins/scaffolds/datasets/types";
import { Tooltip } from "@webiny/ui/Tooltip";
import { JoinBuilder } from "../JoinBuilder/JoinBuilder";
import { CenteredCell } from "../CenteredCell";

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
                <Grid style={{padding:"1rem 0"}} key={index}>
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

const getColName = (column: Partial<ColumnSchema>) =>
    `${column.datasetId ? `${column.datasetId}.` : ""}${column.name}`;

const ColumnSelector: React.FC<{
    template: SelectQuery;
    handleTemplateChange: (key: keyof SelectQuery, value: SelectQuery[keyof SelectQuery]) => void;
    columns: ColumnSchema[];
}> = ({ template, handleTemplateChange, columns }) => {
    const handleToggleColumn = (column: ColumnSchema) => {
        const colName = getColName(column);
        if (template.columns?.find(c => c.name === colName)) {
            handleTemplateChange(
                "columns",
                (template.columns || []).filter(templateCol => templateCol.name !== colName)
            );
        } else {
            handleTemplateChange("columns", [
                ...(template.columns || []),
                {
                    name: colName,
                    type: column.type
                }
            ]);
        }
    };
    const handleColumnAggregate = (
        column: ColumnSchema,
        aggregate: AGGREGATE_FUNCTION_TYPES | undefined
    ) => {
        // console.log('HANDLE AGGREGATE', column, aggregate)
        const colName = getColName(column);
        const newColumns = (template.columns || []).map(templateCol => {
            if (templateCol.name === colName) {
                return {
                    ...templateCol,
                    aggregate
                };
            }
            return templateCol;
        });
        handleTemplateChange("columns", newColumns);
    };

    const templateColumns = template.columns || [];
    // const availableColumns = columns.filter(col => !templateColumns.find(c => c.name === col.name));
    // const addedColumns = columns.filter(col => templateColumns.find(c => c.name === col.name));
    const currentColumnNames = templateColumns.map(column => getColName(column));
    return (
        <div>
            <Grid style={{ padding: "1rem 0" }}>
                <Cell span={12}>
                    <table className="align-cells">
                        <thead>
                            <th></th>
                            <th>
                                <strong>Column</strong>
                            </th>
                            <th>
                                <strong>Type</strong>
                            </th>
                            <th>
                                <strong>Description (hover for more)</strong>
                            </th>
                            <th>
                                <strong>Aggregate</strong>
                            </th>
                        </thead>
                        <tbody>
                            {columns.map(col => (
                                <tr key={`${col.datasetId}-${col.name}`} style={{}}>
                                    <td>
                                        {/* <div style={{padding: "0.5rem 0"}}> */}
                                        <Checkbox
                                            value={currentColumnNames.includes(getColName(col))}
                                            onChange={() => handleToggleColumn(col)}
                                        />
                                        {/* <Switch value={currentColumnNames.includes(col.name)} 
                                            onChange={() => handleToggleColumn(col)}
                                        /> */}
                                        {/* </div> */}
                                    </td>
                                    <td>
                                        {col.dataset ? (
                                            <span
                                                style={{
                                                    pointerEvents: "none",
                                                    marginRight: "0.5rem"
                                                }}
                                            >
                                                <Chip>{col.dataset}</Chip>
                                            </span>
                                        ) : null}
                                        {col.name}
                                    </td>
                                    <td>{col.type}</td>
                                    <td>
                                        <Tooltip content={<span>{col.description}</span>}>
                                            <span>
                                                {col.description.slice(0, 30)}
                                                {col.description.length > 30 && "..."}
                                            </span>
                                        </Tooltip>
                                    </td>
                                    <td>
                                        {col.aggregate}
                                        <AggregateSelector
                                            column={col}
                                            template={template}
                                            handleColumnAggregate={handleColumnAggregate}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Cell>
            </Grid>
        </div>
    );
};

export const AggregateSelector: React.FC<{
    column: ColumnSchema;
    template: SelectQuery;
    handleColumnAggregate: (
        column: ColumnSchema,
        aggregate: AGGREGATE_FUNCTION_TYPES | undefined
    ) => void;
}> = ({ column, template, handleColumnAggregate }) => {
    const colName = getColName(column);
    const templateCol = template?.columns?.find(col => col.name === colName);
    return (
        <Select
            disabled={!templateCol}
            onChange={val => handleColumnAggregate(column, val as AGGREGATE_FUNCTION_TYPES)}
            value={templateCol?.aggregate || undefined}
        >
            {[{ label: "None", value: undefined }, ...AGGREGATE_FUNCTIONS].map(
                ({ label, value }) => (
                    <option key={value} value={value}>
                        {label}
                    </option>
                )
            )}
        </Select>
    );
};

export const QueryBuilder: React.FC<QueryBuilderProps> = ({
    files,
    template,
    onChangeTemplate
}) => {
    console.log(template)
    const [availableColumns, setAvailableColumns] = React.useState<ColumnSchema[]>([]);
    const [groupDialogOpen, setGroupDialogOpen] = React.useState(false);
    const selectedFile = files.find(f => f.filename === template.from);

    const handleTemplateChange = <T extends keyof SelectQuery>(
        key: T | T[],
        value: SelectQuery[T] | SelectQuery[T][]
    ) => {
        if (Array.isArray(key) && Array.isArray(value)) {
            const newTemplate: SelectQuery = {
                ...template
            };
            key.forEach((key, i) => {
                // @ts-ignore
                newTemplate[key] = value[i];
            });
            onChangeTemplate(newTemplate);
        } else if (typeof key === "string" && typeof value !== "undefined") {
            onChangeTemplate({
                ...template,
                [key]: value
            });
        }
    };

    const toggleGroupDialog = () => setGroupDialogOpen(p => !p);

    const handleChangeWhereOperator = (operator: "and" | "or") => {
        onChangeTemplate({
            ...template,
            combinedOperator: operator
        });
    };

    const handleGroupChange = (column: ColumnSchema) => {
        const colName = getColName(column);
        onChangeTemplate({
            ...template,
            groupby: colName
        });
    };

    useEffect(() => {
        if (template.from && !template.join?.length) {
            const columns = files.find(f => f.filename === template.from)?.columns || "[]";
            setAvailableColumns(JSON.parse(columns));
        } else if (template.join?.length) {
            const baseDataset = files.find(f => f.filename === template.from);
            const baseColumns = files.find(f => f.filename === template.from)?.columns || "[]";
            let columns = JSON.parse(baseColumns).map((col: ColumnSchema) => ({
                ...col,
                dataset: baseDataset?.title,
                datasetId: "t0"
            }));
            template.join.forEach((join, idx) => {
                const joinDataset = files.find(f => f.filename === join.from);
                const joinColumns = files.find(f => f.filename === join.from)?.columns || "[]";
                columns = [
                    ...columns,
                    ...JSON.parse(joinColumns).map((col: ColumnSchema) => ({
                        ...col,
                        dataset: joinDataset?.title,
                        datasetId: `t${idx + 1}`
                    }))
                ];
            });
            setAvailableColumns(columns);
        }
        if (!template.from && files.length) {
            handleTemplateChange(["from", "fromS3"], [files[0].filename, true]);
        }
    }, [template.from, files.length, JSON.stringify(template.join)]);

    useEffect(() => {
        const { join, columns } = template;

        const hasJoin = join?.length && join?.length > 0;
        const previouslyNoJoin = columns?.find(col => col?.name?.includes("t0.")) === undefined;
        // append t0 to all columns from the initial dataset if there is a join
        if (hasJoin && previouslyNoJoin) {
            const mutatedColumns = (template.columns || []).map(col => ({
                ...col,
                name: `t0.${col.name}`
            }));

            const mutatedWhere = (template.where || []).map(where => ({
                ...where,
                column: `t0.${where.column}`
            }));
            handleTemplateChange(["columns", "where"], [mutatedColumns, mutatedWhere]);
        } else if (!hasJoin && !previouslyNoJoin) {
            // remove t0 from all columns from the initial dataset if there is no join
            const filteredColumns = (template.columns || [])
                .filter(col => col?.name?.includes("t0."))
                .map(col => ({
                    ...col,
                    name: col?.name?.replace("t0.", "")
                }));

            const filteredWhere = (template.where || [])
                .filter(where => where?.column?.includes("t0."))
                .map(where => ({
                    ...where,
                    column: where?.column?.replace("t0.", "")
                }));

            handleTemplateChange(["where", "columns"], [filteredWhere, filteredColumns]);
        } else if (hasJoin) {
            // todo correct database alias if changed
        }
    }, [template.join?.length]);
    // console.log(template);

    const AndButton = template.combinedOperator === "or" ? Button : ButtonPrimary;
    const OrButton = template.combinedOperator !== "or" ? Button : ButtonPrimary;

    const handleAddJoin = () => {
        handleTemplateChange("join", [
            ...(template.join || []),
            {
                from: files[0].filename,
                fromS3: true,
                leftOn: "",
                rightOn: "",
                operator: "inner"
            }
        ]);
    };
    return (
        <div>
            <h4>Query Builder</h4>
            <br />
            {/* <code>
                {JSON.stringify(
                    template,
                    null,
                    2
                )}
            </code> */}
            <Grid style={{ padding: 0 }}>
                <Cell span={8}>
                    <Select
                        label={"Choose your dataset"}
                        value={selectedFile?.title}
                        options={files.map(f => f.title)}
                        onChange={val => {
                            const newValue = files.find(f => f.title === val)?.filename;
                            handleTemplateChange(["from", "fromS3"], [newValue, true]);
                        }}
                    />
                </Cell>
                <CenteredCell span={2}>
                    <ButtonPrimary onClick={handleAddJoin}>Add Data</ButtonPrimary>
                </CenteredCell>
                <CenteredCell span={2}>
                    <ButtonPrimary onClick={toggleGroupDialog}>Group Data</ButtonPrimary>
                </CenteredCell>
                {template?.join?.length ? (
                    <>
                        {template.join.map((join, idx) => (
                            <Cell span={12} key={idx}>
                                <JoinBuilder
                                    template={template}
                                    join={join}
                                    files={files}
                                    handleTemplateChange={handleTemplateChange}
                                    columns={availableColumns}
                                    idx={idx}
                                />
                            </Cell>
                        ))}
                    </>
                ) : null}
            </Grid>
            {template?.from?.length && (
                <>
                    <ColumnSelector
                        template={template}
                        handleTemplateChange={handleTemplateChange}
                        columns={availableColumns}
                    />
                    <Grid style={{ padding: 0 }}>
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
                            availableColumns?.map(getColName) ||
                            template.columns?.map(getColName) ||
                            []
                        }
                    />
                    <Dialog open={groupDialogOpen} onClose={toggleGroupDialog}>
                        <DialogContent>
                            <p>
                                Grouping data allows you to combine summary statistics by different characteristics, such as a State or ZIP code, category, or other grouping variable.
                                </p>
                            <p>
                                Choose a column to group by:
                            </p>
                            {/* @ts-ignore */}
                            <Select
                                label={"Choose a column"}
                                value={5}
                                onChange={idx => {
                                    handleGroupChange(availableColumns[idx]);
                                }}
                            >
                                {availableColumns.map((col,idx) => (
                                    <option key={col.name} value={idx}>
                                        {col.name}
                                    </option>
                                ))}
                            </Select>
                            
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
};
