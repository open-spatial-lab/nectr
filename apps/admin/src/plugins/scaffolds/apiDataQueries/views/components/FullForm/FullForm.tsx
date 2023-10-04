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
import { FormAPI, GenericFormData } from '@webiny/form/types'
import styled from '@emotion/styled'
import { Stack } from '@mui/material'
import { Checkbox } from '@webiny/ui/Checkbox'
import { SpatialJoinBuilder } from '../../../../../../components/SpatialJoinBuilder'

export type FullFormProps = FormProps & {
  showFull?: boolean
  showSources?: boolean
  showColumns?: boolean
  showSimpleColumns?: boolean
  showJoins?: boolean
  showSpatialJoin?: boolean
  showWheres?: boolean
  showGroupBy?: boolean
}

const NoPaddingForm = styled(SimpleForm)`
  /* padding: 0 1rem; */
  @media (min-width: 840px) {
  margin: 0 0 0 1.5rem;
`
export const FullForm: React.FC<FullFormProps> = ({
  cancelEditing,
  apiDataQuery,
  onSubmit,
  sources,
  setSources,
  setSchema,
  availableSources,
  currentSources,
  datasetsAndDataviews,
  showFull,
  showSources,
  showSpatialJoin,
  showColumns,
  showSimpleColumns,
  showJoins,
  showWheres,
  showGroupBy,
  dataViewTemplate,
  showPreview,
  togglePreview
}) => { 
  const handleUpdate = <T extends GenericFormData>(data: QuerySchema, form: FormAPI<T>) => {
    const formSourceIds = data?.sources?.map(source => source?.id) || []
    const joinIds =
      data?.joins?.map((join: JoinQuery) => [join.leftSourceId, join.rightSourceId]).flat() || []
    let shouldUpdate = false
    let newSources = [...sources]
    const missingSources = joinIds.filter(id => !formSourceIds.includes(id) && Boolean(id))
    const excessSources = formSourceIds.slice(1).filter(id => !joinIds.includes(id))
   
    if (missingSources.length) {
      const missingSourceSchemas = datasetsAndDataviews
        .filter(source => missingSources.includes(source.id))
        .map(source => ({
          id: source.id,
          title: source.title,
          type: source.__typename
        })) as SourceMeta[]
      shouldUpdate = true
      newSources = [...((data?.sources || []) as SourceMeta[]), ...missingSourceSchemas]
    }
    if (excessSources.length) {
      shouldUpdate = true
      newSources = newSources.filter(source => !excessSources.includes(source.id))
    }
    if (shouldUpdate) {
      setSources(newSources)
      form.setValue('sources', newSources)
    } else {
      setSchema(data)
    }
  }

  return (
    <Form<QuerySchema> data={apiDataQuery} onSubmit={onSubmit} onChange={handleUpdate}>
      {({ submit, Bind, form }) => {
        useEffect(() => {
          if (apiDataQuery !== undefined) {
            return
          }
          const today = new Date()
          const date = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
          form.setValue('dataViewTemplate', dataViewTemplate)
          form.setValue('isPublic', true)
          form.setValue('title', `New ${dataViewTemplate} Data View - ${date}`)
        }, [dataViewTemplate])

        return (
          <NoPaddingForm>
            <SimpleFormContent>
              <Grid>
                <Cell span={8}>
                  <Bind name="title" validators={validation.create('required')}>
                    <Input label={'Title'} className="test test" />
                  </Bind>
                </Cell>
                {/* form freaks out when this is not explicit... */}
                <Bind name="dataViewTemplate" validators={validation.create('required')} />
                <Cell span={4} phone={12} tablet={12}>
                  <Stack spacing={2} alignItems="flex-start">
                    <div>
                      <Bind name="isPublic">
                        <Switch
                          label={'Make this data public'}
                          description={'Allow anyone to use this data'}
                        />
                      </Bind>
                    </div>
                    <Checkbox
                      // <Switch
                      label={'Show Preview Table'}
                      value={showPreview}
                      onChange={togglePreview}
                    />
                  </Stack>
                </Cell>

                {Boolean(showSources || showFull) && (
                  <Cell span={12}>
                    <Bind name="sources">
                      {({ onChange, value }) => {
                        const sources = (value || []) as SourceMeta[]
                        const availableSources = datasetsAndDataviews.filter(
                          source => source.id !== apiDataQuery?.id
                        )
                        const handleChange = (source: SourceMeta) => {
                          const { id, title, __typename } = source
                          console.log(source)
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
                    {Boolean(showSpatialJoin || showFull) && (
                      <Cell span={12}>
                      <Bind name="joins">
                        {({ onChange, value }) => {
                          const joins = value as JoinQuery[]
                          console.log(currentSources)
                          return (
                            <>
                              <SpatialJoinBuilder
                                // @ts-ignore
                                leftSource={currentSources[0]}
                                rightSource={currentSources[1]}
                                availableSources={availableSources}
                                join={joins?.[0] || {}}
                                onChange={onChange}
                              />
                            </>
                          )
                        }}
                      </Bind>
                    </Cell>
                    )}
                    {Boolean(showJoins || showFull) && (
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
                    {Boolean(availableSources?.length > 0 && (showColumns || showFull)) && (
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
                    {Boolean(showWheres || showFull) && (
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

                    {Boolean(showGroupBy || showFull) && (
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
          </NoPaddingForm>
        )
      }}
    </Form>
  )
}
