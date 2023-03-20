import React from "react";
import { Form } from "@webiny/form";
import { Grid, Cell } from "@webiny/ui/Grid";
import { Input } from "@webiny/ui/Input";
import { ButtonDefault, ButtonIcon, ButtonPrimary } from "@webiny/ui/Button";
import { CircularProgress } from "@webiny/ui/Progress";
import EmptyView from "@webiny/app-admin/components/EmptyView";
import { validation } from "@webiny/validation";
import { ReactComponent as AddIcon } from "@webiny/app-admin/assets/icons/add-18px.svg";
import {
    SimpleForm,
    SimpleFormFooter,
    SimpleFormContent,
    SimpleFormHeader
} from "@webiny/app-admin/components/SimpleForm";
import { useDataUploadsForm } from "./hooks/useDataUploadsForm";
import { Switch } from "@webiny/ui/Switch";
import { MultiAutoComplete } from "@webiny/ui/AutoComplete";
import { useFiles } from "../../../../customHooks/useFiles"

/**
 * Renders a form which enables creating new or editing existing Data Upload entries.
 * Includes two basic fields - title (required) and description.
 * The form submission-related functionality is located in the `useDataUploadsForm` React hook.
 */
const DataUploadsForm: React.FC = () => {
    const {
        loading,
        emptyViewIsShown,
        currentDataUpload,
        cancelEditing,
        dataUpload,
        onSubmit,
        userList
    } = useDataUploadsForm();
    const files = useFiles();
    console.log(files)

    // Render "No content" selected view.
    if (emptyViewIsShown) {
        return (
            <EmptyView
                title={"Click on the left side list to display Data Uploads details or create a..."}
                action={
                    <ButtonDefault onClick={currentDataUpload}>
                        <ButtonIcon icon={<AddIcon />} /> {"New Data Upload"}
                    </ButtonDefault>
                }
            />
        );
    }
    return (
        <Form data={dataUpload} onSubmit={onSubmit}>
            {({ data, submit, Bind }) => {
                return (
                    <SimpleForm>
                        {loading && <CircularProgress />}
                        <SimpleFormHeader title={data.title || "New Data Upload"} />
                        <SimpleFormContent>
                            <Grid>
                                <Cell span={12}>
                                    <Bind name="title" validators={validation.create("required")}>
                                        <Input label={"Title"} />
                                    </Bind>
                                </Cell>
                                <Cell span={12}>
                                    <Bind
                                        name="description"
                                        validators={validation.create("maxLength:500")}
                                    >
                                        <Input
                                            label={"Description"}
                                            description={"Provide a short description here."}
                                            rows={4}
                                        />
                                    </Bind>
                                </Cell>
                                <Cell span={12}>
                                    <Bind name="isPublic">
                                        <Switch
                                            label={"Data Visible"}
                                            description={
                                                "Should this data be visible to the public?"
                                            }
                                        />
                                    </Bind>
                                </Cell>
                                <Cell span={12}>
                                    <Bind name="canView">
                                        <MultiAutoComplete
                                            options={userList}
                                            label="Can View"
                                            useSimpleValues
                                            description="Users who can view this dataset"
                                        />
                                    </Bind>
                                </Cell>
                                <Cell span={12}>
                                    <Bind name="canEdit">
                                        <MultiAutoComplete
                                            options={userList}
                                            label="Can Edit"
                                            useSimpleValues
                                            description="Users who can edit this dataset"
                                        />
                                    </Bind>
                                </Cell>
                                <Cell span={12}>
                                    <Bind
                                    name="canDelete"
                                >
                                <MultiAutoComplete
                                    options={userList}
                                    label="Can Delete"
                                    useSimpleValues
                                    description="Users who can *delete* this dataset"
                                />
                                </Bind>
                                </Cell>
                            </Grid>
                        </SimpleFormContent>
                        <SimpleFormFooter>
                            <ButtonDefault onClick={cancelEditing}>Cancel</ButtonDefault>
                            <ButtonPrimary
                                onClick={ev => {
                                    submit(ev);
                                }}
                            >
                                Save Data Upload
                            </ButtonPrimary>
                        </SimpleFormFooter>
                    </SimpleForm>
                );
            }}
        </Form>
    );
};

// const UserList: React.FC<{
//     userList: Array<string>
//     value?: Array<string>
//     onChange?: (val: Array<string>) => void
// }> = (props) => {
//     const [textVal, setTextVal] = React.useState('')
//     const [error, setError] = React.useState('')
//     const currData = props.value || []

//     const handleAdd = async () => {
//         try {
//             await validation.validate(textVal.toLocaleLowerCase(), 'in:required:email')
//             props.onChange?.([...currData, textVal])
//             setTextVal('')
//             setError('')
//         } catch (e) {
//             setError("That user doesn't exist.")
//         }
//     }

//     return <div>
//         {currData.map((item: any, index: number) => {
//             return <div key={index}>
//                 <span>{item}</span>
//                 <button onClick={() => {
//                     props.onChange?.(currData.filter((_: any, i: number) => i !== index))
//                 }}
//                 >X</button>
//             </div>
//         })
//         }
//         <TextField value={textVal} onChange={(e) => setTextVal(e.target.value)}  invalid={Boolean(error.length)}/>
//         <button onClick={handleAdd}>Add user</button>
//     </div>
// }
export default DataUploadsForm;
