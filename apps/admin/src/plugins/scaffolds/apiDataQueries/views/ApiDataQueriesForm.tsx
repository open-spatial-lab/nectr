import React, { useMemo } from "react";
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
import { getApiUrl } from "../../../../../../theme/pageElements/utils/dataApiUrl";
import { useApiDataQueriesDataList } from "./hooks/useApiDataQueriesDataList";

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

    const { apiDataQueries } = useApiDataQueriesDataList();
    console.log(apiDataQuery)
    const datasetsAndDataviews = useMemo(
        () => datasets && apiDataQueries ? [...datasets, ...apiDataQueries] : [],
        [datasets, apiDataQueries]
    );

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
    const dataQueryLink = apiDataQuery?.id ? getApiUrl(apiDataQuery.id) : null;

    return (
        <Form data={apiDataQuery} onSubmit={onSubmit}>
            {({ data, submit, Bind }) => (
                <SimpleForm>
                    {loading && <CircularProgress />}
                    <SimpleFormHeader title={data.title || "New Data View"} />
                    <SimpleFormContent>
                        <Grid>
                            <Cell span={10}>
                                <Bind name="title" validators={validation.create("required")}>
                                    <Input label={"Title"} />
                                </Bind>
                            </Cell>
                            <Cell span={2}>
                                <Bind name="isPublic">
                                    <Switch
                                        label={"Make this data public"}
                                        description={"Allow anyone to use this data"}
                                    />
                                </Bind>
                            </Cell>
                            {!!dataQueryLink && (
                                <Cell span={12}>
                                    <a
                                        href={dataQueryLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Data link
                                    </a>
                                </Cell>
                            )}
                            <Cell span={12}>
                                <Bind name="template">
                                    {({ onChange: _onChangeTemplate, value: _template }) => {
                                        const template = JSON.parse(
                                            _template || "{}"
                                        ) as SelectQuery;
                                        const onChangeTemplate = (template: SelectQuery) => {
                                            _onChangeTemplate(JSON.stringify(template));
                                        };
                                        return (
                                            <QueryBuilder
                                                sources={datasetsAndDataviews}
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
