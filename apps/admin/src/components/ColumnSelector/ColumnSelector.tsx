import React, { useEffect } from "react";
import { Grid, Cell } from "@webiny/ui/Grid";
import {
    SelectQuery,
    MetaColumnSchema,
    ColumnSchema,
    AGGREGATE_FUNCTION_TYPES,
    SourceMeta
} from "../QueryBuilder/types";
import { getColName } from "../../utils/getColName";
import { Checkbox } from "@webiny/ui/Checkbox";
import { Chip } from "@webiny/ui/Chips";
import { Tooltip } from "@webiny/ui/Tooltip";
import { AggregateSelector } from "./AggregateSelector";
import {
    List,
    ListItem,
    ListItemText,
    ListItemTextSecondary,
    ListItemGraphic,
    ListItemMeta
} from "@webiny/ui/List";
import { NoPaddingGrid } from "../SplitView";
import { Icon } from "@webiny/ui/Icon";
import { ReactComponent as AddIcon } from "../../assets/noun-add-1154708.svg";
import { onlyUnique } from "../../utils/onlyUnique";

export const ColumnSelector: React.FC<{
    sources: SourceMeta[];
    handleTemplateChange: (key: keyof SelectQuery, value: SelectQuery[keyof SelectQuery]) => void;
    currentColumns: Array<MetaColumnSchema>;
}> = ({ sources, handleTemplateChange, currentColumns }) => {
    return null
    // const handleToggleColumn = (column: MetaColumnSchema) => {
    //     const findColumn = (c: Partial<MetaColumnSchema>) =>
    //         c.name === column.name && c.sourceId === column.sourceId;
    //     if (template.columns?.find(c => findColumn(c))) {
    //         handleTemplateChange(
    //             "columns",
    //             (template.columns || []).filter(c => !findColumn(c))
    //         );
    //     } else {
    //         handleTemplateChange("columns", [
    //             ...(template.columns || []),
    //             {
    //                 name: column.name,
    //                 type: column.type,
    //                 sourceId: column.sourceId,
    //                 sourceTitle: column.sourceTitle
    //             }
    //         ]);
    //     }
    // };
    // const handleColumnAggregate = (
    //     column: ColumnSchema,
    //     aggregate: AGGREGATE_FUNCTION_TYPES | undefined
    // ) => {
    //     const colName = getColName(column);
    //     const newColumns = (template.columns || []).map(templateCol => {
    //         if (templateCol.name === colName) {
    //             return {
    //                 ...templateCol,
    //                 aggregate
    //             };
    //         }
    //         return templateCol;
    //     });
    //     handleTemplateChange("columns", newColumns);
    // };

    // const templateColumns = template.columns || [];
    
    // const datasets = [template.from, ...(template.join?.map(join => join.leftSourceId) || []), ...(template.join?.map(join => join.rightSourceId) || [])]
    // const uniqueDatasets = datasets.filter((val:, index, self) => self.findIndex(val.) === index)

    // const [activeDataset, setActiveDataset] = React.useState(datasets?.[0]);

    // const filteredColumns = currentColumns.filter(
    //     col =>
    //         col.sourceId === activeDataset?.id &&
    //         !templateColumns.find(
    //             templateCol =>
    //                 templateCol.name === col.name && templateCol.sourceId === col.sourceId
    //         )
    // );

    // useEffect(() => {
    //     if (datasets.length === 1) {
    //         setActiveDataset(datasets[0]);
    //     }
    // }, [datasets.length]);

    // if (!datasets.length) {
    //     return null;
    // }
    // return (
    //     <NoPaddingGrid>
    //         <Cell span={4}>
    //             <List>
    //                 <ListItem style={{ fontWeight: "bold", pointerEvents: "none" }}>
    //                     <ListItemText>Data Sources</ListItemText>
    //                 </ListItem>
    //                 {datasets.map((dataset, idx) => (
    //                     <ListItem
    //                         key={`${dataset?.id}${idx}`}
    //                         style={{
    //                             borderBottom: "1px solid rgba(0,0,0,0.5)",
    //                             backgroundColor:
    //                                 activeDataset?.id === dataset?.id
    //                                     ? "var(--highlighted)"
    //                                     : "transparent"
    //                         }}
    //                         onClick={() => setActiveDataset(dataset)}
    //                     >
    //                         <ListItemText>{dataset.title}</ListItemText>
    //                     </ListItem>
    //                 ))}
    //             </List>
    //         </Cell>
    //         <Cell span={4}>
    //             <List>
    //                 <ListItem style={{ fontWeight: "bold", pointerEvents: "none" }}>
    //                     <ListItemText>{activeDataset.title} Columns</ListItemText>
    //                 </ListItem>
    //                 <div style={{ height: "30vh", overflowY: "auto" }}>
    //                     {filteredColumns.map((column, idx) => (
    //                         <ListItem
    //                             key={`${column?.name}${idx}`}
    //                             onClick={() => handleToggleColumn(column)}
    //                             style={{paddingTop: '.5rem', paddingBottom: '.5rem'}}
    //                         >
    //                             {/* <ListItemGraphic>
    //                                 <Icon icon={<AddIcon />} />
    //                             </ListItemGraphic> */}
    //                             <ListItemText>
    //                                 {column.name}
    //                                 <ListItemTextSecondary>
    //                                     {column.description}
    //                                 </ListItemTextSecondary>
    //                             </ListItemText>
    //                         </ListItem>
    //                     ))}
    //                 </div>
    //             </List>
    //         </Cell>
    //         <Cell span={4}>
    //             {templateColumns.length === 0 ? (
    //                 <p
    //                     style={{
    //                         padding: "1rem",
    //                         background: "rgba(0,0,0,0.1)",
    //                         marginTop: "1rem"
    //                     }}
    //                 >
    //                     <i>
    //                         Choose a dataset on the left column, then choose a column to add to your
    //                         data view.
    //                     </i>
    //                 </p>
    //             ) : (
    //                 <List>
    //                     <ListItem style={{ fontWeight: "bold", pointerEvents: "none" }}>
    //                         <ListItemText>Data View Columns</ListItemText>
    //                     </ListItem>
    //                     <div style={{ height: "30vh", overflowY: "auto" }}>
    //                         {templateColumns.map((column, idx) => (
    //                             <ListItem key={`${column?.name}${idx}`}>
    //                                 <ListItemText>{column?.name}</ListItemText>
    //                             </ListItem>
    //                         ))}
    //                     </div>
    //                 </List>
    //             )}
    //         </Cell>
    //     </NoPaddingGrid>
    // );
};
// return (
//     <div>
//         <Grid style={{ padding: "1rem 0" }}>
//             <Cell span={12}>
//                 <table className="align-cells">
//                     <thead>
//                         <tr>
//                             <th></th>
//                             <th>
//                                 <strong>Column</strong>
//                             </th>
//                             <th>
//                                 <strong>Type</strong>
//                             </th>
//                             <th>
//                                 <strong>Description (hover for more)</strong>
//                             </th>
//                             <th>
//                                 <strong>Aggregate</strong>
//                             </th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {columns.map(col => (
//                             <tr key={`${col.datasetId}-${col.name}`} style={{}}>
//                                 <td>
//                                     {/* <div style={{padding: "0.5rem 0"}}> */}
//                                     <Checkbox
//                                         value={currentColumnNames.includes(getColName(col))}
//                                         onChange={() => handleToggleColumn(col)}
//                                     />
//                                     {/* <Switch value={currentColumnNames.includes(col.name)}
//                                         onChange={() => handleToggleColumn(col)}
//                                     /> */}
//                                     {/* </div> */}
//                                 </td>
//                                 <td>
//                                     {col.dataset ? (
//                                         <span
//                                             style={{
//                                                 pointerEvents: "none",
//                                                 marginRight: "0.5rem"
//                                             }}
//                                         >
//                                             <Chip>{col.dataset}</Chip>
//                                         </span>
//                                     ) : null}
//                                     {col.name}
//                                 </td>
//                                 <td>{col.type}</td>
//                                 <td>
//                                     <Tooltip content={<span>{col.description}</span>}>
//                                         <span>
//                                             {col.description.slice(0, 30)}
//                                             {col.description.length > 30 && "..."}
//                                         </span>
//                                     </Tooltip>
//                                 </td>
//                                 <td>
//                                     {col.aggregate}
//                                     <AggregateSelector
//                                         column={col}
//                                         template={template}
//                                         handleColumnAggregate={handleColumnAggregate}
//                                     />
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </Cell>
//         </Grid>
//     </div>
// );
