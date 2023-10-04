import React, { useEffect } from 'react'
import { JOIN_OPERATORS, JoinQuery, QueryBuilderProps, SelectQuery, SourceMeta } from './types'
import { Select } from '@webiny/ui/Select'
import { ButtonDefault as Button, ButtonPrimary, IconButton } from '@webiny/ui/Button'
import { Grid, Cell } from '@webiny/ui/Grid'
import { Dialog, DialogContent, DialogAccept, DialogCancel } from '@webiny/ui/Dialog'
import { ColumnSchema } from '../../plugins/scaffolds/datasets/types'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import { ReactComponent as DeleteIcon } from '@webiny/ui/AutoComplete/icons/delete.svg'
import { ReactComponent as SettingsIcon } from '@webiny/app-admin/assets/icons/round-settings-24px.svg'
import { styled } from '@mui/system'
import { useColumns } from '../../customHooks/useColumns'
// import { WhereBuilder } from '../WhereBuilder'
import { getColName } from '../../utils/getColName'
// import { ColumnSelector } from '../ColumnSelector/ColumnSelector'

const GroupHeader = styled('div')(() => ({
  position: 'sticky',
  top: '-8px',
  padding: '4px 10px',
  background: 'white',
  fontWeight: 'bold'
}))

const GroupItems = styled('ul')({
  padding: 0
})

const typenameMapping = {
  Dataset: 'Datasets',
  ApiDataQuery: 'Data Views'
}
export const QueryBuilder: React.FC<QueryBuilderProps> = ({
  sources,
  template,
  onChangeTemplate
}) => {
  const [groupDialogOpen, setGroupDialogOpen] = React.useState(false)
  const selectedFile = sources.find(source => source.id === template?.from?.id)
  const [joinDiagOpen, setJoinDiagOpen] = React.useState<
    | { open: false }
    | { open: true; leftOnColumns: ColumnSchema[]; rightOnColumns: ColumnSchema[]; idx: number }
  >({
    open: false
  })
  const [tempJoin, setTempJoin] = React.useState<Partial<JoinQuery>>({})
  const handleTemplateChange = <T extends keyof SelectQuery>(
    key: T | T[],
    value: SelectQuery[T] | SelectQuery[T][]
  ) => {
    if (Array.isArray(key) && Array.isArray(value)) {
      const newTemplate: SelectQuery = {
        ...template
      }
      key.forEach((key, i) => {
        // @ts-ignore
        newTemplate[key] = value[i]
      })
      onChangeTemplate(newTemplate)
    } else if (typeof key === 'string' && typeof value !== 'undefined') {
      onChangeTemplate({
        ...template,
        [key]: value
      })
    }
  }

  const toggleGroupDialog = () => setGroupDialogOpen(p => !p)

  const handleChangeWhereOperator = (operator: 'and' | 'or') => {
    onChangeTemplate({
      ...template,
      combinedOperator: operator
    })
  }

  const handleGroupChange = (column: ColumnSchema) => {
    const colName = getColName(column)
    onChangeTemplate({
      ...template,
      groupby: colName
    })
  }

  const availableColumns = useColumns(template, sources)
  // todo: hook to remove columns when dataset is removed
  // useManageColumns(handleTemplateChange, availableColumns)

  useEffect(() => {
    const { join, columns } = template

    const hasJoin = join?.length && join?.length > 0
    const previouslyNoJoin = columns?.find(col => col?.name?.includes('t0.')) === undefined
    // append t0 to all columns from the initial dataset if there is a join
    if (hasJoin && previouslyNoJoin) {
      const mutatedColumns = (template.columns || []).map(col => ({
        ...col,
        name: `t0.${col.name}`
      }))

      const mutatedWhere = (template.where || []).map(where => ({
        ...where,
        column: `t0.${where.column}`
      }))
      handleTemplateChange(['columns', 'where'], [mutatedColumns, mutatedWhere])
    } else if (!hasJoin && !previouslyNoJoin) {
      // remove t0 from all columns from the initial dataset if there is no join
      const filteredColumns = (template.columns || [])
        .filter(col => col?.name?.includes('t0.'))
        .map(col => ({
          ...col,
          name: col?.name?.replace('t0.', '')
        }))

      const filteredWhere = (template.where || [])
        .filter(where => where?.column?.includes('t0.'))
        .map(where => ({
          ...where,
          column: where?.column?.replace('t0.', '')
        }))

      handleTemplateChange(['where', 'columns'], [filteredWhere, filteredColumns])
    } else if (hasJoin) {
      // todo correct database alias if changed
    }
  }, [template.join?.length])
  // console.log(template);

  const AndButton = template.combinedOperator === 'or' ? Button : ButtonPrimary
  const OrButton = template.combinedOperator !== 'or' ? Button : ButtonPrimary

  const handleAddJoin = (source: SourceMeta) => {
    const previousJoin = template.join || []

    handleTemplateChange('join', [
      ...previousJoin,
      {
        leftSourceId: template.from.id,
        leftOn: '',
        rightSourceId: source.id,
        rightOn: '',
        operator: 'inner'
      }
    ])
  }

  const handleConfirmJoin = () => {
    // @ts-ignore
    const idx = joinDiagOpen.idx
    if (!template.join) {
      return
    }
    const newJoin = [...template.join]
    newJoin[idx] = {
      ...newJoin[idx],
      ...tempJoin
    }
    handleTemplateChange('join', newJoin)
    setJoinDiagOpen({
      open: false
    })
  }

  const handleOpenJoinDialog = (_idx: number, join: JoinQuery) => () => {
    // const fromName = 'asdf' //sources.find(f => f.filename === join.from)?.title;
    // @ts-ignore
    // const rightOnColumns = [] // availableColumns.filter(col => col.dataset === fromName);
    // @ts-ignore
    // const leftOnColumns = [] //availableColumns.filter(col => col.dataset !== fromName);
    // setJoinDiagOpen({
    //     open: true,
    //     leftOnColumns,
    //     rightOnColumns,
    //     idx
    // });
    setTempJoin({
      leftOn: join.leftOn,
      rightOn: join.rightOn,
      operator: join.operator
    })
  }

  console.log(template)

  return (
    <div>
      {/* <h4>Query Builder</h4> */}
      {/* <br /> */}
      {/* <code>
                {JSON.stringify(
                    template,
                    null,
                    2
                )}
            </code> */}
      <Grid style={{ padding: 0 }}>
        <Cell
          span={12}
          style={{
            background: '#f5f5f577',
            padding: '1rem',
            border: '1px solid #e0e0e0'
          }}
        >
          <h2
            style={{
              marginBottom: '1rem',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >
            Start From
          </h2>
          <Autocomplete<(typeof sources)[number]>
            disablePortal
            sx={{ flexGrow: 1 }}
            id="dataset-select"
            options={sources}
            getOptionLabel={option => option.title}
            groupBy={option => option.__typename}
            value={selectedFile}
            defaultValue={selectedFile}
            onChange={(_, newValue) => {
              if (newValue) {
                const { id, __typename, title } = newValue
                handleTemplateChange('from', { id, type: __typename, title })
              }
            }}
            renderGroup={params => (
              <li key={params.key}>
                <GroupHeader>
                  {params.group in typenameMapping
                    ? // @ts-ignore
                      typenameMapping[params.group]
                    : params.group}
                </GroupHeader>
                <GroupItems>{params.children}</GroupItems>
              </li>
            )}
            renderInput={params => (
              <TextField {...params} label="Dataset" defaultValue={selectedFile?.title} />
            )}
          />
        </Cell>

        <Cell
          span={12}
          style={{
            // light blue bacground
            // background: "#72CDC155",
            padding: '1rem',
            border: '1px solid #72CDC1'
          }}
        >
          <h2
            style={{
              marginBottom: '1rem',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}
          >
            Add more data:
          </h2>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Autocomplete<(typeof sources)[number]>
              disablePortal
              sx={{ flexGrow: 1 }}
              id="dataset-select"
              options={sources.filter(source => source.id !== selectedFile?.id)}
              getOptionLabel={option => option.title}
              groupBy={option => option.__typename}
              value={selectedFile}
              defaultValue={selectedFile}
              onChange={(_, newValue) => {
                if (newValue) {
                  handleAddJoin(newValue)
                  // handleTemplateChange("from", newValue);
                }
              }}
              renderGroup={params => (
                <li key={params.key}>
                  <GroupHeader>
                    {params.group in typenameMapping
                      ? // @ts-ignore
                        typenameMapping[params.group]
                      : params.group}
                  </GroupHeader>
                  <GroupItems>{params.children}</GroupItems>
                </li>
              )}
              renderInput={params => (
                <TextField {...params} label="Dataset" defaultValue={selectedFile?.title} />
              )}
            />
            {template?.join?.length ? (
              <>
                {template.join.map((join, idx) => {
                  // const joinedFile = sources.find(
                  //     file => file.filename === join.from
                  // );
                  const handleRemove = () => {
                    const newJoin = [...(template?.join || [])]
                    newJoin.splice(idx, 1)
                    handleTemplateChange('join', newJoin)
                  }
                  return (
                    <div
                      key={idx}
                      style={{
                        display: 'inline-block',
                        minWidth: '100px',
                        margin: '.25rem'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 0 0 .5rem',
                          background: '#eee',
                          borderRadius: '1rem'
                        }}
                      >
                        <span style={{ paddingRight: '0.5rem' }}>{/* {joinedFile?.title} */}</span>
                        {/* settings */}
                        <IconButton
                          icon={<SettingsIcon />}
                          label="Join Settings these data"
                          onClick={handleOpenJoinDialog(idx, join)}
                        />
                        {/* remove */}
                        <IconButton
                          icon={<DeleteIcon />}
                          onClick={handleRemove}
                          label="Remove these data"
                        >
                          asdf
                        </IconButton>
                      </div>
                    </div>
                  )
                })}
              </>
            ) : null}
          </div>
        </Cell>
        {/* <Cell
                    span={12}
                    style={{
                        // light blue bacground
                        background: "#ECFFE3",
                        padding: "1rem",
                    }}
                >

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-start",
                                alignItems: "center",
                                marginBottom: "1rem"
                            }}
                        >
                <h2
                    style={{
                        marginBottom: "1rem",
                        marginRight: "1rem",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                    }}
                >
                    Filter your data:
                </h2>
                        <AndButton onClick={() => handleChangeWhereOperator("and")}>
                            Data must match all
                        </AndButton>
                        <OrButton onClick={() => handleChangeWhereOperator("or")}>
                            Data could match any
                        </OrButton>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}
                    >
                        
                        <Autocomplete
                            disablePortal
                            sx={{ flexGrow: 0, width: 300 }}
                            id="filter-select"
                            options={availableColumns.map(f => f.name)}
                            value={null}
                            onChange={(event, newValue) => {
                                const newFile = files.find(f => f.title === newValue);
                                handleAddJoin(newFile?.filename);
                            }}
                            renderInput={params => (
                                <TextField {...params} label={`Choose a data column to filter`} />
                            )}
                        />
                        <br />
                    </div>
                    <div
                        style={{
                            flexGrow: 1,
                            paddingLeft: "1rem"
                        }}
                    ></div>
                </Cell> */}
        {/* <Cell span={12}>
                    <Tabs onActivate={e => console.log(e)}>
                        <Tab label="Select Data">asdf</Tab>
                        <Tab label="Summarize Data">asdf2</Tab>
                    </Tabs>
                </Cell> */}
        <Cell
          span={12}
          style={{
            // light blue bacground
            background: '#efefef',
            padding: '1rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              marginBottom: '1rem'
            }}
          >
            <div>
              <h2
                style={{
                  marginBottom: '1rem',
                  marginRight: '1rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              >
                Summarize your data:
              </h2>
              <p>Choose a column to summarize data based on:</p>
            </div>
          </div>
          <Autocomplete
            disablePortal
            id="filter-select"
            options={availableColumns.map(f => f.name)}
            value={template.groupby}
            onChange={(event, newValue) => {
              const column = availableColumns.find(f => f.name === newValue)
              if (!column) {
                return
              }
              handleGroupChange(column)
            }}
            renderInput={params => (
              <TextField {...params} label={`Choose a column that data should group by`} />
            )}
          />
        </Cell>
      </Grid>
      {template?.from?.id && (
        <>
          {/* <ColumnSelector
                        // template={template}
                        sources={[]}
                        handleTemplateChange={handleTemplateChange}
                        columns={availableColumns}
                    /> */}
          <Grid style={{ padding: 0 }}>
            <Cell span={6} desktop={6} tablet={6}>
              <p>Data Filters</p>
            </Cell>
            <Cell span={6} desktop={6} tablet={6}>
              <AndButton onClick={() => handleChangeWhereOperator('and')}>All of thse</AndButton>
              <OrButton onClick={() => handleChangeWhereOperator('or')}>Any of these</OrButton>
            </Cell>
          </Grid>

          {/* <WhereBuilder
                        template={template}
                        handleTemplateChange={handleTemplateChange}
                        columns={
                            availableColumns?.map(getColName) ||
                            template.columns?.map(getColName) ||
                            []
                        }
                    /> */}
          <Dialog open={groupDialogOpen} onClose={toggleGroupDialog}>
            <DialogContent>
              <p>
                Grouping data allows you to combine summary statistics by different characteristics,
                such as a State or ZIP code, category, or other grouping variable.
              </p>
              {/* @ts-ignore */}
              <Select
                label={'Choose a column'}
                value={template.groupby}
                onChange={idx => {
                  handleGroupChange(availableColumns[idx])
                }}
              >
                {availableColumns.map((col, idx) => (
                  <option key={col.name} value={idx}>
                    {col.name}
                  </option>
                ))}
              </Select>
            </DialogContent>
          </Dialog>

          <Dialog open={!!joinDiagOpen.open} onClose={() => setJoinDiagOpen({ open: false })}>
            <div style={{ padding: '1rem' }}>
              <h1>Add More Data Settings</h1>
              <hr />
              <p>
                Data Joins connect two or more tables of data. Below, select the column from dataset
                name that you want to connect to your other data.
              </p>
              <br />
              {joinDiagOpen.open && (
                <Select
                  label={'Left on'}
                  value={tempJoin.leftOn}
                  onChange={val => {
                    setTempJoin(j => ({
                      ...j,
                      leftOn: val
                    }))
                  }}
                >
                  {joinDiagOpen.leftOnColumns.map(col => {
                    return (
                      <option
                        value={`${col.datasetId}.${col.name}`}
                        key={`${col.datasetId}___${col.name}`}
                      >
                        [{col.dataset}] {col.name}
                      </option>
                    )
                  })}
                </Select>
              )}
              <br />
              {joinDiagOpen.open && (
                <Select
                  label={'Right on'}
                  value={tempJoin.rightOn}
                  onChange={val => {
                    setTempJoin({
                      ...tempJoin,
                      rightOn: val
                    })
                  }}
                >
                  {joinDiagOpen.rightOnColumns.map(col => {
                    return (
                      <option
                        value={`${col.datasetId}.${col.name}`}
                        key={`${col.datasetId}___${col.name}`}
                      >
                        [{col.dataset}] {col.name}
                      </option>
                    )
                  })}
                </Select>
              )}
              <br />
              <Select
                label={'Join Type'}
                value={tempJoin.operator}
                onChange={val => {
                  setTempJoin({
                    ...tempJoin,
                    operator: val
                  })
                }}
              >
                {JOIN_OPERATORS.map(operator => {
                  return (
                    <option value={operator} key={operator}>
                      {operator.charAt(0).toUpperCase() + operator.slice(1)}
                    </option>
                  )
                })}
              </Select>
            </div>
            <DialogCancel>Cancel</DialogCancel>
            <DialogAccept onClick={handleConfirmJoin}>OK</DialogAccept>
          </Dialog>
        </>
      )}
    </div>
  )
}
