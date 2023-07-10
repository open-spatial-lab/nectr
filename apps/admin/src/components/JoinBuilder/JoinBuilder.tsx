// import React from "react";
// import { JoinBuilderProps } from "./types";
// import { Select } from "@webiny/ui/Select";
// // import { Cell } from "@webiny/ui/Grid";
// import { NoPaddingGrid } from "../SplitView";
// // import { faTrashCan, faCaretSquareRight } from "@fortawesome/free-regular-svg-icons";
// import { faGear } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // import { Icon } from "@webiny/ui/Icon";
// import { CenteredCell } from "../CenteredCell";
// import { Dialog, DialogAccept, DialogCancel } from "@webiny/ui/Dialog";
// import { ButtonDefault as Button } from "@webiny/ui/Button";
// // import { Chip } from "@webiny/ui/Chips";
// import { JOIN_OPERATORS } from "../QueryBuilder/types";

// export const JoinBuilder: React.FC<JoinBuilderProps> = ({
//     join,
//     files,
//     template,
//     handleTemplateChange,
//     columns,
//     idx
// }) => {
//     // const selectedFile = files.find(file => file.filename === join.from);

//     const [showDialog, setShowDialog] = React.useState(false);
//     const [deleteConfirm, setDeleteConfirm] = React.useState(false);
//     const [tempJoin, setTempJoin] = React.useState({
//         leftOn: join.leftOn,
//         rightOn: join.rightOn,
//         operator: join.operator
//     });

//     const handleRemove = () => {
//         const newJoin = [...(template?.join || [])];
//         newJoin.splice(idx, 1);
//         handleTemplateChange("join", newJoin);
//         setDeleteConfirm(false);
//     };

//     const handleConfirmJoin = () => {
//         const newJoin = [...(template?.join || [])];
//         newJoin[idx] = {
//             ...newJoin[idx],
//             ...tempJoin
//         };
//         handleTemplateChange("join", newJoin);
//         setShowDialog(false);
//     };

//     return (
//         <NoPaddingGrid>
//             {/* <CenteredCell span={1}>
//                 <FontAwesomeIcon
//                     // @ts-ignore
//                     icon={faCaretSquareRight}
//                     style={{ width: "1.5rem", height: "1.5rem" }}
//                 />
//             </CenteredCell> */}
//             {/* <Cell span={7}> */}
//                 {/* <Select
//                     label={"Choose your dataset"}
//                     value={selectedFile?.title}
//                     options={files.map(f => f.title)}
//                     onChange={val => {
//                         const newValue = files.find(f => f.title === val)?.filename;
//                         const newJoin = [...(template?.join || [])];
//                         if (!newValue || !newJoin[idx]) {
//                             return;
//                         }
//                         newJoin[idx].from = newValue;
//                         handleTemplateChange("join", newJoin);
//                     }}
//                 /> */}
//             {/* </Cell> */}
//             <CenteredCell span={2}>
//                 <Button onClick={() => setShowDialog(true)}>
//                     <FontAwesomeIcon
//                         // @ts-ignore
//                         icon={faGear}
//                         style={{ width: "1.5rem", height: "1.5rem" }}
//                     />
//                 </Button>
//             </CenteredCell>
//             <CenteredCell span={2}>
//                 <Button onClick={() => setDeleteConfirm(true)}>
//                     <FontAwesomeIcon
//                         // @ts-ignore
//                         icon={faTrashCan}
//                         style={{ width: "1.5rem", height: "1.5rem" }}
//                     />
//                 </Button>
            // </CenteredCell>
            // <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
            //     <div style={{ padding: "1rem" }}>
            //         <h3>Data Join Settings</h3>
            //         <br />
            //         <Select
            //             label={"Left on"}
            //             value={tempJoin.leftOn}
            //             onChange={val => {
            //                 setTempJoin({
            //                     ...tempJoin,
            //                     leftOn: val
            //                 });
            //             }}
            //         >
            //             {columns.map(col => {
            //                 return (
            //                     <option
            //                         value={`${col.datasetId}.${col.name}`}
            //                         key={`${col.datasetId}___${col.name}`}
            //                     >
            //                         [{col.dataset}] {col.name}
            //                     </option>
            //                 );
            //             })}
            //         </Select>
            //         <br />
            //         <Select
            //             label={"Right on"}
            //             value={tempJoin.rightOn}
            //             onChange={val => {
            //                 setTempJoin({
            //                     ...tempJoin,
            //                     rightOn: val
            //                 });
            //             }}
            //         >
            //             {columns.map(col => {
            //                 return (
            //                     <option
            //                         value={`${col.datasetId}.${col.name}`}
            //                         key={`${col.datasetId}___${col.name}`}
            //                     >
            //                         [{col.dataset}] {col.name}
            //                     </option>
            //                 );
            //             })}
            //         </Select>
            //         <br />
            //         <Select
            //             label={"Join Type"}
            //             value={tempJoin.operator}
            //             onChange={val => {
            //                 setTempJoin({
            //                     ...tempJoin,
            //                     operator: val
            //                 });
            //             }}
            //         >
            //             {JOIN_OPERATORS.map(operator => {
            //                 return (
            //                     <option value={operator} key={operator}>
            //                         {operator.charAt(0).toUpperCase() + operator.slice(1)}
            //                     </option>
            //                 );
            //             })}
            //         </Select>
            //         {/* <Select 
            //             label="Right On"
            //             value={tempJoin.rightOn}
            //             options={columns}
            //             onChange={val => {
            //                 setTempJoin({
            //                     ...tempJoin,
            //                     rightOn: val
            //                 });
            //             }}
            //         />
            //         <Select 
            //             label={"Operator"} */}
            //     </div>
            //     <DialogCancel>Cancel</DialogCancel>
            //     <DialogAccept onClick={handleConfirmJoin}>OK</DialogAccept>
            // </Dialog>
//             <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
//                 <div style={{ padding: "1rem" }}>Are you sure you want to delete this join?</div>
//                 <DialogCancel>Cancel</DialogCancel>
//                 <DialogAccept onClick={handleRemove}>Yes</DialogAccept>
//             </Dialog>
//         </NoPaddingGrid>
//     );
// };
export const JoinBuilder = () => {
    return null;
}
