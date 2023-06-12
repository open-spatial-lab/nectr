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
import { useApiDataQueriesForm } from "./hooks/useApiDataQueriesForm";
import { Switch } from "@webiny/ui/Switch";
import { QueryBuilder } from "../../../../components/QueryBuilder/QueryBuilder";
import { SelectQuery } from "../../../../components/QueryBuilder/types";


/**
 * Renders a form which enables creating new or editing existing Api Data Query entries.
 * Includes two basic fields - title (required) and template.
 * The form submission-related functionality is located in the `useApiDataQueriesForm` React hook.
 */
const ApiDataQueriesForm: React.FC = () => {
    const {
        loading,
        emptyViewIsShown,
        currentApiDataQuery,
        cancelEditing,
        apiDataQuery,
        onSubmit,
        datasets
    } = useApiDataQueriesForm();
    
    if (emptyViewIsShown) {
        return (
            <EmptyView
                title={"Click on the left side list to display Data View details or create a..."}
                action={
                    <ButtonDefault onClick={currentApiDataQuery}>
                        <ButtonIcon icon={<AddIcon />} /> {"New Data View"}
                    </ButtonDefault>
                }
            />
        );
    }
    return (
        <Form data={apiDataQuery} onSubmit={onSubmit}>
            {({ data, submit, Bind }) => (
                <SimpleForm>
                    {loading && <CircularProgress />}
                    <SimpleFormHeader title={data.title || "New Data View"} />
                    <SimpleFormContent>
                        <Grid>
                            <Cell span={12}>
                                <Bind name="title" validators={validation.create("required")}>
                                    <Input label={"Title"} />
                                </Bind>
                            </Cell>
                            <Cell span={12}>
                                <Bind name="isPublic">
                                    <Switch
                                        label={"Make this data public"}
                                        description={"Should this data be visible to the public?"}
                                    />
                                </Bind>
                            </Cell>
                            <Cell span={12}>
                                <Bind name="template">
                                    {({ onChange: _onChangeTemplate, value: _template }) => {
                                        const template = JSON.parse(
                                            _template || "{}"
                                        ) as SelectQuery;
                                        const onChangeTemplate = (template: object) => {
                                            _onChangeTemplate(JSON.stringify(template));
                                        }
                                        return (
                                            <QueryBuilder
                                                files={datasets || []}
                                                template={template}
                                                onChangeTemplate={onChangeTemplate}
                                            />
                                        );
                                    }}
                                </Bind>
                            </Cell>

                            {/* <Cell span={12}>
                                <Typography use="headline6">SQL Template</Typography>
                                <br />
                                <Bind name="template">
                                    <CodeEditor
                                        mode="handlebars"
                                        theme="github"
                                        description="Data View Template in SQL. Use handlebars syntax for dynamic variables (eg. `SELECT * FROM table WHERE population > {{value}}`)."
                                    />
                                </Bind>
                            </Cell> */}
                            {/* <Cell span={12}>
                                <Typography use="headline6">Default Values</Typography>
                                <br /> */}
                            {/* <Bind name="defaultParameters">
                                    {({ onChange, value }) => (
                                        <ParamsEditor
                                            value={value}
                                            onChange={onChange}
                                            data={data}
                                        />
                                    )}
                                </Bind> */}
                            {/* </Cell> */}
                            {/* <Cell span={12}>
                                <Bind
                                    name="defaultParameters"
                                >
                                    <CodeEditor
                                        mode="json"
                                        theme="github"
                                        description="Default placeholder variables."
                                    />
                                </Bind>
                            </Cell> */}
                        </Grid>
                    </SimpleFormContent>
                    <SimpleFormFooter>
                        <ButtonDefault onClick={cancelEditing}>Cancel</ButtonDefault>
                        <ButtonPrimary
                            onClick={ev => {
                                submit(ev);
                            }}
                        >
                            Save Api Data Query
                        </ButtonPrimary>
                    </SimpleFormFooter>
                </SimpleForm>
            )}
        </Form>
    );
};

export default ApiDataQueriesForm;
