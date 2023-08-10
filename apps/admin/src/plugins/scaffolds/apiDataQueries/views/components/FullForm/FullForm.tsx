import React, { useEffect } from 'react'
import { Form } from '@webiny/form'
import { Grid, Cell } from '@webiny/ui/Grid'
import { Input } from '@webiny/ui/Input'
import { ButtonDefault, ButtonPrimary } from '@webiny/ui/Button'
import { validation } from '@webiny/validation'
import {
  SimpleForm,
  SimpleFormFooter,
  SimpleFormContent
} from '@webiny/app-admin/components/SimpleForm'
import { Switch } from '@webiny/ui/Switch'
import {
  GroupByQuery,
  JoinQuery,
  MetaColumnSchema,
  SourceMeta,
  WhereQuery
} from '../../../../../../components/QueryBuilder/types'
import SourceSelector from '../../../../../../components/SourceSelector'
import { ColumnSelector } from '../../../../../../components/ColumnSelector/ColumnSelector'
import { JoinBuilder } from '../../../../../../components/JoinBuilder/JoinBuilder'
import { WhereBuilder } from '../../../../../../components/WhereBuilder'
import { GroupByBuilder } from '../../../../../../components/GroupByBuilder/GroupByBuilder'
import { FormProps } from '../../hooks/useDataView/types'
import { QuerySchema } from '../../../../../../components/QueryBuilder/types'

export type FullFormProps = FormProps & {
  showFull?: boolean
  showSources?: boolean
  showColumns?: boolean
  showSimpleColumns?: boolean
  showJoins?: boolean
  showWheres?: boolean
  showGroupBy?: boolean
}

export const FullForm: React.FC<FullFormProps> = props => {
  const {
    cancelEditing,
    apiDataQuery,
    onSubmit,
    sources,
    setSources,
    availableSources,
    currentSources,
    dataQueryLink,
    datasetsAndDataviews,
    showFull,
    showSources,
    showColumns,
    showSimpleColumns,
    showJoins,
    showWheres,
    showGroupBy,
    dataViewTemplate
  } = props
  
  return (
    <Form<QuerySchema> data={apiDataQuery} onSubmit={onSubmit}>
      {({ data, submit, Bind, form }) => {
        const formSourceIds = data?.sources?.map((source) => source?.id)
        const joinIds =
          data?.joins?.map((join: JoinQuery) => [join.leftSourceId, join.rightSourceId]).flat() ||
          []

        useEffect(() => {
          if (joinIds?.length && !!formSourceIds) {
            let shouldUpdate = false
            let newSources = [...sources]
            const missingSources = joinIds.filter((id) => !formSourceIds.includes(id))
            const excessSources = formSourceIds
              .slice(1)
              .filter((id) => !joinIds.includes(id))

            if (missingSources.length) {
              const missingSourceSchemas = datasetsAndDataviews
                .filter((source) => missingSources.includes(source.id))
                .map((source) => ({
                  id: source.id,
                  title: source.title,
                  type: source.__typename
                })) as SourceMeta[]
              shouldUpdate = true
              newSources = [...(data?.sources||[]) as SourceMeta[], ...missingSourceSchemas]
            }
            if (excessSources.length) {
              shouldUpdate = true
              newSources = newSources.filter(
                (source) => !excessSources.includes(source.id)
              )
            }
            if (shouldUpdate) {
              setSources(newSources)
              form.setValue('sources', newSources)
            }
          }
        }, [JSON.stringify(formSourceIds), JSON.stringify(joinIds), datasetsAndDataviews?.length])
        useEffect(() => {
          const today = new Date()
          const date = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
          form.setValue('dataViewTemplate', dataViewTemplate)
          form.setValue('isPublic', true)
          form.setValue('title', `New ${dataViewTemplate} Data View - ${date}`)
        }, [dataViewTemplate])
   
        return (
          <SimpleForm>
            <SimpleFormContent>
              <Grid>
                <Cell span={8}>
                  <Bind name="title" validators={validation.create('required')}>
                    <Input label={'Title'} className="test test" />
                  </Bind>
                </Cell>
                {/* form freaks out when this is not explicit... */}
                <Bind name="dataViewTemplate" validators={validation.create('required')} />
                <Cell span={4}>
                  <Bind name="isPublic">
                    <Switch
                      label={'Make this data public'}
                      description={'Allow anyone to use this data'}
                    />
                  </Bind>
                </Cell>

                {!!(showSources || showFull) && (
                  <Cell span={12}>
                    <Bind name="sources">
                      {({ onChange, value }) => {
                        const sources = (value || []) as SourceMeta[]
                        const availableSources = datasetsAndDataviews.filter(
                          source => source.id !== apiDataQuery?.id
                          )
                        const handleChange = (source: SourceMeta) => {
                          const { id, title, __typename } = source
                          const newSources = [
                            {
                              id,
                              title,
                              type: __typename
                            },
                            ...sources.slice(1)
                          ]
                          onChange(newSources)
                          setSources(newSources as SourceMeta[])
                        }

                        return (
                          <>
                            <br />
                            <h3 style={{ fontSize: '2rem' }}>Data Source</h3>
                            {dataQueryLink && (
                              <a href={dataQueryLink} target="_blank" rel="noopener noreferrer">
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
                        )
                      }}
                    </Bind>
                  </Cell>
                )}
                {currentSources?.length > 0 && (
                  <>
                    {availableSources?.length > 0 && !!(showColumns || showFull) && (
                      <Cell span={12}>
                        <Bind name="columns">
                          {({ onChange, value }) => {
                            const currentColumns = value || ([] as MetaColumnSchema[])
                            return (
                              <>
                                <br />
                                <br />
                                <br />
                                <h3 style={{ fontSize: '2rem' }}>Columns</h3>
                                <br />
                                <ColumnSelector
                                  currentColumns={currentColumns as MetaColumnSchema[]}
                                  onChange={onChange}
                                  sources={currentSources}
                                  simple={showSimpleColumns}
                                />
                              </>
                            )
                          }}
                        </Bind>
                      </Cell>
                    )}
                    {!!(showJoins || showFull) && (
                      <Cell span={12}>
                        <Bind name="joins">
                          {({ onChange, value }) => {
                            const joins = value as JoinQuery[]
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
                            )
                          }}
                        </Bind>
                      </Cell>
                    )}
                    {!!(showWheres || showFull) && (
                      <Cell span={12}>
                        <Bind name="wheres">
                          {({ onChange, value }) => {
                            const wheres = value as WhereQuery[]

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
                            )
                          }}
                        </Bind>
                      </Cell>
                    )}

                    {!!(showGroupBy || showFull) && (
                      <Cell span={12}>
                        <Bind name="groupbys">
                          {({ onChange, value: groupBys }) => {
                            return (
                              <>
                                <br />
                                <br />
                                <br />
                                <p style={{ fontSize: '2rem' }}>Group Data</p>
                                <br />
                                <GroupByBuilder
                                  sources={currentSources}
                                  groupbys={(groupBys as GroupByQuery[]) || []}
                                  onChange={onChange}
                                />
                              </>
                            )
                          }}
                        </Bind>
                      </Cell>
                    )}
                  </>
                )}
              </Grid>
            </SimpleFormContent>
            <SimpleFormFooter>
              <ButtonDefault onClick={cancelEditing}>Cancel</ButtonDefault>
              <ButtonPrimary
                onClick={submit}
                style={{
                  textTransform: 'none'
                }}
              >
                Save Data View
              </ButtonPrimary>
            </SimpleFormFooter>
          </SimpleForm>
        )
      }}
    </Form>
  )
}
