import React, { useEffect, useMemo } from "react";
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
    SimpleFormContent
    // SimpleFormHeader
} from "@webiny/app-admin/components/SimpleForm";
import { useApiDataQueriesForm } from "./hooks/useApiDataQueriesForm";
import { Switch } from "@webiny/ui/Switch";
// import { QueryBuilder } from "../../../../components/QueryBuilder/QueryBuilder";
import {
    GroupByQuery,
    JoinQuery,
    MetaColumnSchema,
    // QuerySchema, SelectQuery,
    SourceMeta,
    WhereQuery
} from "../../../../components/QueryBuilder/types";
import { getApiUrl } from "../../../../../../theme/pageElements/utils/dataApiUrl";
import { useApiDataQueriesDataList } from "./hooks/useApiDataQueriesDataList";
import SourceSelector from "../../../../components/SourceSelector";
import { ColumnSelector } from "../../../../components/ColumnSelector/ColumnSelector";
import { JoinBuilder } from "../../../../components/JoinBuilder/JoinBuilder";
import { WhereBuilder } from "../../../../components/WhereBuilder";
import { GroupByBuilder } from "../../../../components/GroupByBuilder/GroupByBuilder";
// import { ColumnSchema } from "../../dataUploads/types";

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
    const [sources, setSources] = React.useState<SourceMeta[]>([]);
    const { apiDataQueries } = useApiDataQueriesDataList();
    const currentIds = sources?.map(source => source.id) || [];
    const datasetsAndDataviews = useMemo(
        () => (datasets && apiDataQueries ? [...datasets, ...apiDataQueries] : []),
        [datasets, apiDataQueries]
    );

    useEffect(() => {
        if (apiDataQuery?.sources?.length) {
            setSources(apiDataQuery.sources);
        }
    }, [apiDataQuery?.sources?.length]);

    const { availableSources, currentSources } = useMemo(() => {
        const availableSources: SourceMeta[] = [];
        const currentSources: SourceMeta[] = [];
        for (const source of datasetsAndDataviews) {
            if (currentIds.includes(source.id)) {
                currentSources.push(source);
            } else {
                availableSources.push(source);
            }
        }
        return {
            availableSources,
            currentSources
        };
    }, [datasetsAndDataviews?.length, JSON.stringify(currentIds)]);

    const dataQueryLink = apiDataQuery?.id ? getApiUrl(apiDataQuery.id) : null;
    return (
        <Form data={apiDataQuery} onSubmit={onSubmit}>
            {({ data, submit, Bind, form }) => {
                console.log(data)
                const formSourceIds = data?.sources?.map((source: SourceMeta) => source?.id);
                const joinIds: String[] =
                    data?.joins
                        ?.map((join: JoinQuery) => [join.leftSourceId, join.rightSourceId])
                        .flat() || [];

                useEffect(() => {
                    if (joinIds?.length) {
                        let shouldUpdate = false;
                        let newSources = [...sources];
                        const missingSources = joinIds.filter(
                            (id: String) => !formSourceIds.includes(id)
                        );
                        const excessSources = formSourceIds
                            .slice(1)
                            .filter((id: String) => !joinIds.includes(id));

                        if (missingSources.length) {
                            const missingSourceSchemas = datasetsAndDataviews
                                .filter((source: SourceMeta) => missingSources.includes(source.id))
                                .map((source: SourceMeta) => ({
                                    id: source.id,
                                    title: source.title,
                                    type: source.__typename
                                }));
                            shouldUpdate = true;
                            newSources = [...data.sources, ...missingSourceSchemas];
                        }
                        if (excessSources.length) {
                            shouldUpdate = true;
                            newSources = newSources.filter(
                                (source: SourceMeta) => !excessSources.includes(source.id)
                            );
                        }
                        if (shouldUpdate) {
                            setSources(newSources);
                            form.setValue("sources", newSources);
                        }
                    }
                }, [
                    JSON.stringify(formSourceIds),
                    JSON.stringify(joinIds),
                    datasetsAndDataviews?.length
                ]);

                if (emptyViewIsShown) {
                    return (
                        <EmptyView
                            title={
                                "Click on the left side list to display Data View details or create a..."
                            }
                            action={
                                <ButtonDefault onClick={currentApiDataQuery}>
                                    <ButtonIcon icon={<AddIcon />} /> {"New Data View"}
                                </ButtonDefault>
                            }
                        />
                    );
                }
                return (
                    <SimpleForm>
                        {loading && <CircularProgress />}
                        {/* <SimpleFormHeader title={data.title || "New Data View"} /> */}
                        <SimpleFormContent>
                            <Grid>
                                <Cell span={8}>
                                    <Bind name="title" validators={validation.create("required")}>
                                        <Input label={"Title"} className="test test" />
                                    </Bind>
                                </Cell>
                                <Cell span={4}>
                                    <Bind name="isPublic">
                                        <Switch
                                            label={"Make this data public"}
                                            description={"Allow anyone to use this data"}
                                        />
                                    </Bind>
                                </Cell>
                                {/* {!!dataQueryLink && (
                                    <Cell span={12}>
                                        <a
                                            href={dataQueryLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Data link
                                        </a>
                                    </Cell>
                                )} */}

                                <Cell span={12}>
                                    <Bind name="sources">
                                        {({ onChange, value }) => {
                                            const sources = (value || []) as SourceMeta[];
                                            const availableSources = datasetsAndDataviews.filter(
                                                source => source.id !== apiDataQuery?.id
                                            );
                                            const handleChange = (source: SourceMeta) => {
                                                const { id, title, __typename } = source;
                                                const newSources = [
                                                    {
                                                        id,
                                                        title,
                                                        type: __typename
                                                    },
                                                    ...sources.slice(1)
                                                ];
                                                onChange(newSources);
                                                setSources(newSources as SourceMeta[]);
                                            };

                                            return (
                                                <>
                                                    <br />
                                                    <h3 style={{ fontSize: "2rem" }}>
                                                        Data Source
                                                    </h3>
                                                    {dataQueryLink && (
                                                        <a
                                                            href={dataQueryLink}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            Data link
                                                        </a>
                                                    )}
                                                    <br />
                                                    <SourceSelector
                                                        sources={availableSources}
                                                        onChange={handleChange}
                                                        value={sources[0]}
                                                    />
                                                </>
                                            );
                                        }}
                                    </Bind>
                                    {availableSources?.length > 0 && (
                                        <Bind name="columns">
                                            {({ onChange, value }) => {
                                                const currentColumns =
                                                    value || ([] as MetaColumnSchema[]);
                                                return (
                                                    <>
                                                        <br />
                                                        <br />
                                                        <br />
                                                        <h3 style={{ fontSize: "2rem" }}>
                                                            Columns
                                                        </h3>
                                                        <br />
                                                        <ColumnSelector
                                                            currentColumns={
                                                                currentColumns as MetaColumnSchema[]
                                                            }
                                                            onChange={onChange}
                                                            sources={currentSources}
                                                        />
                                                    </>
                                                );
                                            }}
                                        </Bind>
                                    )}
                                </Cell>
                                <Cell span={12}>
                                    <Bind name="joins">
                                        {({ onChange, value }) => {
                                            const joins = value as JoinQuery[];
                                            return (
                                                <>
                                                    <hr />
                                                    <br />
                                                    <h3>Join Additional Data</h3>
                                                    <br />
                                                    <JoinBuilder
                                                        currentSources={currentSources}
                                                        availableSources={availableSources}
                                                        joins={joins || []}
                                                        onChange={onChange}
                                                    />
                                                </>
                                            );
                                        }}
                                    </Bind>
                                </Cell>
                                <Cell span={12}>
                                    <Bind name="wheres">
                                        {({ onChange, value }) => {
                                            const wheres = value as WhereQuery[];

                                            return (
                                                <>
                                                    <hr />
                                                    <br />
                                                    <h3>Filter Data</h3>
                                                    <br />
                                                    <WhereBuilder
                                                        currentSources={currentSources}
                                                        wheres={wheres || []}
                                                        onChange={onChange}
                                                    />
                                                </>
                                            );
                                        }}
                                    </Bind>
                                </Cell>
                                <Cell span={12}>
                                    <Bind name="groupbys">
                                        {({ onChange, value }) => {
                                            const groupbys = value as GroupByQuery[];
                                            console.log(groupbys);
                                            return (
                                                <>
                                                    <br />
                                                    <br />
                                                    <br />
                                                    <p style={{ fontSize: "2rem" }}>Group Data</p>
                                                    <br />
                                                    <GroupByBuilder
                                                        sources={currentSources}
                                                        groupbys={groupbys || []}
                                                        onChange={onChange}
                                                    />
                                                </>
                                            );
                                        }}
                                    </Bind>
                                </Cell>
                            </Grid>
                        </SimpleFormContent>
                        <SimpleFormFooter>
                            <ButtonDefault onClick={cancelEditing}>Cancel</ButtonDefault>
                            <ButtonPrimary
                                onClick={ev => {
                                    console.log(ev);
                                    submit(ev);
                                }}
                                style={{
                                    textTransform: "none"
                                }}
                            >
                                Save Data View
                            </ButtonPrimary>
                        </SimpleFormFooter>
                    </SimpleForm>
                );
            }}
        </Form>
    );
};

export default ApiDataQueriesForm;
