import React, { useState } from "react";
import { Form, type FormAPI } from "@webiny/form";
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
import { useDatasetsForm } from "./hooks/useDatasetsForm";
import { useMutation, useApolloClient } from "@apollo/react-hooks";
import get from "lodash/get";
import {
    CREATE_FILE,
    CreateFileMutationVariables,
    CreateFileMutationResponse
} from "@webiny/app-admin/components/FileManager/graphql";
import { type FileItem } from "@webiny/app-admin/components/FileManager/types";
import getFileUploader from "@webiny/app-admin/components/FileManager/getFileUploader";
import { ColumnSchema } from "../types";
import { FileUploader } from "../assets/FileUploader";
import { TablePreview } from "../assets/TablePreview";
import { Switch } from "@webiny/ui/Switch";
import ColumnBuilder from "../../../../components/ColumnBuilder";
import { getApiUrl } from "../../../../../../theme/pageElements/utils/dataApiUrl";

/**
 * Renders a form which enables creating new or editing existing Dataset entries.
 * Includes two basic fields - title (required) and description.
 * The form submission-related functionality is located in the `useDatasetsForm` React hook.
 */
const DatasetsForm: React.FC = () => {
    const { loading, emptyViewIsShown, currentDataset, cancelEditing, dataset, onSubmit } =
        useDatasetsForm();

    const [uploading, setUploading] = useState({
        status: "not uploaded",
        filename: ""
    });

    const [table, setTable] = useState<{
        columns: any[];
        data: any[][];
    }>({
        columns: [],
        data: [[]]
    });

    const apolloClient = useApolloClient();

    const [createFile] = useMutation<CreateFileMutationResponse, CreateFileMutationVariables>(
        CREATE_FILE,
        {}
    );
    const uploadFile =
        (form: FormAPI) =>
        async (files: FileItem): Promise<number | null> => {
            setUploading({
                status: "uploading",
                filename: files.name
            });
            const file: FileItem = Array.isArray(files) ? files[0] : files;
            const filetype = file.type.split("/")[0];
            const errors: any[] = [];

            try {
                const response = await getFileUploader()(file, { apolloClient });
                const createFileResponse = await createFile({
                    variables: {
                        data: {
                            ...response,
                            tags: ["data upload", filetype]
                        }
                    }
                });

                const fileUploadData = get(
                    createFileResponse,
                    "data.fileManager.createFile.data"
                ) as unknown as FileItem;
                
                const metadataUrl = new URL(getApiUrl("__"));
                metadataUrl.searchParams.append("__metadata__", fileUploadData.key);
                const metadataResponse = await fetch(metadataUrl.toString());
                const {
                    columns,
                    preview
                } = await metadataResponse.json();

                const colList = JSON.parse(columns).map((col: ColumnSchema) => col.name);
                const dataList = preview.map((row: Record<string, any>) => Object.values(row));

                setTable({
                    columns: colList,
                    data: dataList
                });
                setUploading({
                    status: "uploaded",
                    filename: fileUploadData.name
                });
                

                form.setValue("columns", columns);
                form.setValue("filename", fileUploadData.name);
                
                return 1;
            } catch (e) {
                errors.push({ file, e });
            }

            return null;
        };

    // const handlePreview = (setValue: Function) => (results: Papa.ParseResult<unknown>) => {
    //     if (results.errors.length > 0) {
    //         return;
    //     }
    //     const columns = results.data[0] as unknown[];
    //     const data = results.data.slice(1) as any[][];
    //     setTable({
    //         columns,
    //         data
    //     });
    //     const columnData: Array<ColumnSchema> = columns.map(column => ({
    //         name: column as string,
    //         type: "Text",
    //         description: `A column named "${column}"`
    //     }));

    //     setValue("columns", JSON.stringify(columnData));
    // };

    if (emptyViewIsShown) {
        return (
            <EmptyView
                title={"Click on the left side list to display Datasets details or create a..."}
                action={
                    <ButtonDefault onClick={currentDataset}>
                        <ButtonIcon icon={<AddIcon />} /> {"New Dataset"}
                    </ButtonDefault>
                }
            />
        );
    }

    return (
        <Form data={dataset} onSubmit={onSubmit}>
            {({ form, data, submit, Bind }) => (
                <SimpleForm>
                    {loading && <CircularProgress />}
                    <SimpleFormHeader title={data.title || "New Dataset"} />
                    <FileUploader
                        uploading={uploading}
                        uploadFile={uploadFile(form)}
                        form={form}
                    />

                    <SimpleFormContent>
                        <Grid>
                            <Cell span={5}>
                                <Bind name="title" validators={validation.create("required")}>
                                    <Input label={"Title"} />
                                </Bind>
                            </Cell>
                            <Cell span={5}>
                                <Bind name="filename" validators={validation.create("required")}>
                                    <Input label={"File"} disabled />
                                </Bind>
                            </Cell>
                            <Cell span={2}>
                                <TablePreview table={table} />
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
                                <Bind name="columns">
                                    {({ value: _columns }) => {
                                        const columns = JSON.parse(
                                            _columns || "[]"
                                        ) as Array<ColumnSchema>;

                                        const onChangeColumns = (columns: object) => {
                                            form.setValue("columns", JSON.stringify(columns));
                                        };

                                        return (
                                            <ColumnBuilder
                                                columns={columns}
                                                onChange={onChangeColumns}
                                            />
                                        );
                                    }}
                                </Bind>
                            </Cell>
                            <Cell span={12}>
                                <Bind name="isPublic">
                                    <Switch
                                        label={"Data Visible"}
                                        description={"Should this data be visible to the public?"}
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
                            Save Dataset
                        </ButtonPrimary>
                    </SimpleFormFooter>
                </SimpleForm>
            )}
        </Form>
    );
};

export default DatasetsForm;
