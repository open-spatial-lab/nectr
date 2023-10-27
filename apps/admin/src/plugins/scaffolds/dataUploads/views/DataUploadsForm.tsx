import React, { useState } from 'react'
import { Form } from '@webiny/form'
import { Grid, Cell } from '@webiny/ui/Grid'
import { Input } from '@webiny/ui/Input'
import { ButtonDefault, ButtonIcon, ButtonPrimary } from '@webiny/ui/Button'
import { CircularProgress } from '@webiny/ui/Progress'
import EmptyView from '@webiny/app-admin/components/EmptyView'
import { validation } from '@webiny/validation'
import { ReactComponent as AddIcon } from '@webiny/app-admin/assets/icons/add-18px.svg'
import {
  SimpleForm,
  SimpleFormFooter,
  SimpleFormContent,
  SimpleFormHeader
} from '@webiny/app-admin/components/SimpleForm'
import { useDataUploadsForm } from './hooks/useDataUploadsForm'
import { Switch } from '@webiny/ui/Switch'
import { MultiAutoComplete } from '@webiny/ui/AutoComplete'
// @ts-ignore
// import * as ta from "type-analyzer";
// import
// ÷ FileManagerView,
//  {
//     type FileManagerViewProps
// } from "@webiny/app-admin/components/FileManager/FileManagerView";
import { type FileItem } from '@webiny/app-admin/components/FileManager/types'
import getFileUploader from '@webiny/app-admin/components/FileManager/getFileUploader'
// import { FileManagerProvider } from "@webiny/app-admin/components/FileManager/FileManagerContext";
import { useMutation, useApolloClient } from '@apollo/react-hooks'
import get from 'lodash/get'
import {
  // LIST_FILES,
  CREATE_FILE,
  // GET_FILE_SETTINGS,
  CreateFileMutationVariables,
  CreateFileMutationResponse
  // ListFilesQueryResponse,
  // ListFilesQueryVariables
} from '@webiny/app-admin/components/FileManager/graphql'
import { Dialog, DialogAccept } from '@webiny/ui/Dialog'
// @ts-ignore
import Files from 'react-butterfiles'
import {
  DataTable,
  DataTableBody,
  DataTableHead,
  DataTableContent,
  DataTableHeadCell,
  DataTableCell,
  DataTableRow
} from '@rmwc/data-table'
import '@rmwc/data-table/data-table.css'

import { DisableGate } from '../../../../components/DisabledGate'
import * as Papa from 'papaparse'
import { ColumnSchema } from '../types'
import ColumnBuilder from '../../../../components/ColumnBuilder'
import { getApiUrl } from 'apps/theme/pageElements/utils/dataApiUrl'
// import { MutationUpdaterFn } from "apollo-client/core/watchQueryOptions";

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" viewBox="0 0 24 24">
    <path fill="none" d="M0 0h24v24H0V0z" />
    <path
      fill="currentColor"
      d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l4.65-4.65c.2-.2.51-.2.71 0L17 13h-3z"
    />
  </svg>
)

const TablePreview: React.FC<{ table: { columns: any[]; data: any[][] } }> = ({ table }) => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <ButtonDefault onClick={() => setOpen(true)}>Preview Data Table</ButtonDefault>
      <Dialog open={open}>
        <DialogAccept onClick={() => setOpen(false)}>Close</DialogAccept>
        <div style={{ maxWidth: '100%', overflow: 'auto' }}>
          <DataTable>
            <DataTableContent>
              <DataTableHead>
                <DataTableRow>
                  {table.columns.map((column, index) => (
                    <DataTableHeadCell key={index}>{column}</DataTableHeadCell>
                  ))}
                </DataTableRow>
              </DataTableHead>
              <DataTableBody>
                {table.data.map((row, irow) => (
                  <DataTableRow key={irow}>
                    {row.map((cell, icell) => (
                      <DataTableCell key={`${irow}-${icell}`}>{cell}</DataTableCell>
                    ))}
                  </DataTableRow>
                ))}
              </DataTableBody>
            </DataTableContent>
          </DataTable>
        </div>
      </Dialog>
    </>
  )
}

/**
 * Renders a form which enables creating new or editing existing Data Upload entries.
 * Includes two basic fields - title (required) and description.
 * The form submission-related functionality is located in the `useDataUploadsForm` React hook.
 */
const DataUploadsForm: React.FC = () => {
  const [uploading, setUploading] = useState({
    status: 'not uploaded',
    filename: ''
  })

  const [table, setTable] = useState<{
    columns: any[]
    data: any[][]
  }>({
    columns: [],
    data: [[]]
  })

  const {
    loading,
    emptyViewIsShown,
    currentDataUpload,
    cancelEditing,
    dataUpload,
    onSubmit,
    userList
  } = useDataUploadsForm()

  const apolloClient = useApolloClient()

  // const updateCacheAfterCreateFile: MutationUpdaterFn<CreateFileMutationResponse> = (
  //     cache,
  //     newFile
  // ) => {
  //     const newFileData = get(newFile, "data.fileManager.createFile.data");

  //     const data = cache.readQuery<ListFilesQueryResponse>({
  //         query: LIST_FILES
  //     });

  //     // cache.writeQuery({
  //     //     query: LIST_FILES,
  //     //     data: {
  //     //         fileManager: {
  //     //             ...(data?.fileManager || {}),
  //     //             listFiles: {
  //     //                 ...(data?.fileManager || {}).listFiles,
  //     //                 data: [newFileData, ...((data?.fileManager?.listFiles || {}).data || [])]
  //     //             }
  //     //         }
  //     //     }
  //     // });
  // };

  const [createFile] = useMutation<CreateFileMutationResponse, CreateFileMutationVariables>(
    CREATE_FILE,
    {
      // update: updateCacheAfterCreateFile
    }
  )

  // const viewProps: FileManagerViewProps = {
  //     // ...forwardProps,
  //     onChange: console.log,
  //     accept: []
  // };

  const dataFilesTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
    'application/vnd.ms-excel.template.macroEnabled.12',
    'application/vnd.ms-excel.addin.macroEnabled.12',
    'application/vnd.ms-excel.sheet.binary.macroEnabled.12',
    // parquet
    'application/octet-stream',
    // csv
    'text/csv',
    // json
    'application/json',
    // xml
    'application/xml',
    // zip
    'application/zip',
    // gzip
    'application/gzip',
    // tar
    'application/x-tar',
    // tgz
    'application/x-compressed'
    // tgz
  ]

  const uploadFile =
    (setValue: Function) =>
    async (files: FileItem): Promise<number | null> => {
      console.log('uploading file...', files)
      setUploading({
        status: 'uploading',
        filename: files.name
      })
      const list: FileItem[] = Array.isArray(files) ? files : [files]

      const errors: any[] = []
      const uploadedFiles: FileItem[] = []
      await Promise.all(
        list.map(async file => {
          try {
            const response = await getFileUploader()(file, { apolloClient })
            /**
             * Add "tags" while creating the new file.
             */
            const createFileResponse = await createFile({
              variables: {
                data: {
                  ...response,
                  tags: []
                }
              }
            })
            const fileResponse = get(
              createFileResponse,
              'data.fileManager.createFile.data'
            ) as unknown as FileItem
            uploadedFiles.push(fileResponse)
            const fileResponseFull = get(createFileResponse, 'data.fileManager') as unknown

            // console.log('fileResponse', fileResponse)
            // console.log(' createFileResponse',  fileResponseFull)
            // console.log('full response', createFileResponse)
            // const previewResponse = await fetch()
            // Save create file data for later
          } catch (e) {
            errors.push({ file, e })
          }
        })
      )

      setUploading({
        status: 'uploaded',
        filename: uploadedFiles[0].name
      })

      return null
    }

  // Render "No content" selected view.
  if (emptyViewIsShown) {
    return (
      <EmptyView
        title={'Click on the left side list to display Data Uploads details or create a...'}
        action={
          <ButtonDefault onClick={currentDataUpload}>
            <ButtonIcon icon={<AddIcon />} /> {'New Data Upload'}
          </ButtonDefault>
        }
      />
    )
  }
  return (
    <Form data={dataUpload} onSubmit={onSubmit}>
      {({ form, data, submit, Bind }) => {
        return (
          <SimpleForm>
            {loading && <CircularProgress />}
            <SimpleFormHeader title={data.title || 'New Data Upload'} />

            <Files
              multiple={false}
              maxSize={'1TB'}
              multipleMaxSize={'1TB'}
              accept={dataFilesTypes}
              onSuccess={(files: any[]) => {
                const title = files[0].name.split('.').slice(0, -1).join('.')
                uploadFile(form.setValue)(files[0].src.file as FileItem)
                form.setValue('title', title)
              }}
              onError={(errors: any) => {
                console.error('File selection error', errors)
              }}
            >
              {({ browseFiles }: { browseFiles: any }) => (
                <>
                  <ButtonPrimary
                    onClick={browseFiles}
                    disabled={uploading.status === 'uploading'}
                    style={{ marginLeft: '1rem', marginTop: '1rem' }}
                  >
                    <ButtonIcon icon={<UploadIcon />} />
                    <p style={{ marginLeft: '0.25rem' }}>Upload...</p>
                  </ButtonPrimary>
                  {uploading.status === 'uploading' && (
                    <span style={{ marginLeft: '1rem', marginTop: '1rem' }}>
                      Uploading {uploading.filename}...
                    </span>
                  )}
                </>
              )}
            </Files>
            {/* <DisableGate disabled={uploading.status !== "uploaded"}> */}
            <SimpleFormContent>
              <Grid>
                <Cell span={8}>
                  <Bind name="title" validators={validation.create('required')}>
                    <Input label={'Title'} />
                  </Bind>
                </Cell>
                <Cell span={4}>
                  <TablePreview table={table} />
                </Cell>
                <Cell span={12}>
                  <Bind name="description" validators={validation.create('maxLength:500')}>
                    <Input
                      label={'Description'}
                      description={'Provide a short description here.'}
                      rows={4}
                    />
                  </Bind>
                </Cell>

                <Cell span={12}>
                  <Bind name="columns">
                    {({ value: _columns }) => {
                      const columns = JSON.parse(_columns || '[]') as Array<ColumnSchema>

                      const onChangeColumns = (columns: object) => {
                        form.setValue('columns', JSON.stringify(columns))
                      }

                      return <ColumnBuilder columns={columns} onChange={onChangeColumns} />
                    }}
                  </Bind>
                </Cell>
                <Cell span={12}>
                  <Bind name="isPublic">
                    <Switch
                      label={'Data Visible'}
                      description={'Should this data be visible to the public?'}
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
                  <Bind name="canDelete">
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
            {/* </DisableGate> */}
            <SimpleFormFooter>
              <ButtonDefault onClick={cancelEditing}>Cancel</ButtonDefault>
              <ButtonPrimary
                onClick={ev => {
                  // form.setValue("columns", "[]")
                  submit(ev)
                }}
              >
                Save Data Upload
              </ButtonPrimary>
            </SimpleFormFooter>
          </SimpleForm>
        )
      }}
    </Form>
  )
}

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
export default DataUploadsForm
