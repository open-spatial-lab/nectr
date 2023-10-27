import React, { useEffect, useRef, useState } from 'react'
import { Form, type FormAPI } from '@webiny/form'
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
import { useDatasetsForm } from './hooks/useDatasetsForm'
import { useMutation, useApolloClient } from '@apollo/react-hooks'
import get from 'lodash/get'
import {
  CREATE_FILE,
  CreateFileMutationVariables,
  CreateFileMutationResponse
} from '@webiny/app-admin/components/FileManager/graphql'
import { type FileItem } from '@webiny/app-admin/components/FileManager/types'
import getFileUploader from '@webiny/app-admin/components/FileManager/getFileUploader'
import { ColumnSchema } from '../types'
import { FileUploader } from '../assets/FileUploader'
import { TablePreview } from '../assets/TablePreview'
import { Switch } from '@webiny/ui/Switch'
import ColumnBuilder from '../../../../components/ColumnBuilder'
import { getApiUrl, getFileUrl } from '../../../../../../theme/pageElements/utils/dataApiUrl'

const S_IN_MS = 1000
const TIMEOUT_INTERVAL = 1 * S_IN_MS
const TIMEOUT_TOTAL_DURATION = 60 * S_IN_MS

const resolveFile = (files: FileItem) => {
  const file: FileItem = Array.isArray(files) ? files[0] : files
  const fileParts = file.name.split('.')
  const filetype = fileParts[fileParts.length - 1] || 'unknown-filetype'
  const suffix = filetype !== 'parquet' ? '__toconvert____dataset__' : '__dataset__'
  const fileName = `${fileParts.slice(0, fileParts.length - 1).join('.')}`
  const revisedFileName = `${fileName}${suffix}.${filetype}`

  Object.defineProperty(file, 'name', {
    get: function () {
      return this._name
    },
    set: function (value) {
      this._name = value
    }
  })

  file.name = revisedFileName
  return {
    file,
    filetype,
    converting: suffix.includes('__toconvert__'),
    outputFileName: `${fileName}__dataset__.parquet`,
    statusFileName: `${fileName}__status__.json`
  }
}
const INITIAL_UPLOAD_STATE = {
  status: "not uploaded",
  filename: "",
}

const INITIAL_TABLE_STATE = {
  columns: [],
  data: [[]],
}
/**
 * Renders a form which enables creating new or editing existing Dataset entries.
 * Includes two basic fields - title (required) and description.
 * The form submission-related functionality is located in the `useDatasetsForm` React hook.
 */
const DatasetsForm: React.FC = () => {
  const formApi = useRef<FormAPI | null>(null)
  const {
    loading,
    emptyViewIsShown,
    handleNewDataset,
    cancelEditing,
    dataset,
    onSubmit,
    currentDatasetId,
  } = useDatasetsForm()
  const [uploading, setUploading] = useState(INITIAL_UPLOAD_STATE)
  console.log(dataset)
  const [table, setTable] = useState<{
    columns: any[]
    data: any[][]
  }>(INITIAL_TABLE_STATE)

  useEffect(() => {
    setUploading(INITIAL_UPLOAD_STATE)
    setTable(INITIAL_TABLE_STATE)
  }, [currentDatasetId])

  const apolloClient = useApolloClient()

  const [createFile] = useMutation<
    CreateFileMutationResponse,
    CreateFileMutationVariables
  >(CREATE_FILE, {})

  const handleMeta = async (key: string, _form?: FormAPI) => {
    console.log('handle meta', key)
    const form = _form || formApi.current
    const metadataUrl = new URL(getApiUrl("__"))
    metadataUrl.searchParams.append("__metadata__", key)
    const metadataResponse = await fetch(metadataUrl.toString())
    if (metadataResponse.ok) {
      const { columns, preview } = await metadataResponse.json()
      const parsedColumns = JSON.parse(columns).map((col: ColumnSchema) => ({
        ...col,
        ...(form?.data["columns"].find(
          (c: ColumnSchema) => c.name === col.name
        ) || {}),
      }))
      const colList = parsedColumns.map((col: ColumnSchema) => col.name)
      const dataList = preview.map((row: Record<string, any>) =>
        Object.values(row)
      )
      setTable({ columns: colList, data: dataList })
      setUploading({
        status: "uploaded",
        filename: key,
      })
      form && form.setValue("filename", key)
      form && form.setValue("columns", parsedColumns)
      form && form.setValue("isPublic", true)
    }
  }

  const uploadFile =
    (form: FormAPI) =>
    async (files: FileItem): Promise<number | null> => {
      if (!formApi.current) {
        formApi.current = form
      }
      // Placeholder status
      setUploading({
        status: "uploading",
        filename: files.name,
      })
      // Resolve filenames with appropriate suffixes
      //  __dataset__ blocks public access
      // __toconvert____dataset__ blocks public access and triggers conversion
      const { file, filetype, converting } = resolveFile(files)
      const errors: any[] = []

      try {
        // get presigned PUT request for file on S3
        const response = await getFileUploader()(file, { apolloClient })
        // upload file to S3
        const createFileResponse = await createFile({
          variables: {
            data: {
              ...response,
              tags: ["dataset", filetype],
              meta: {
                private: true,
              },
            },
          },
        })
        const fileUploadData = get(
          createFileResponse,
          "data.fileManager.createFile.data"
        ) as unknown as FileItem
        if (!converting) {
          await handleMeta(fileUploadData.key, form)
        } else {
          const fileNameNoSuffix = fileUploadData.name
            .split(".")
            .slice(0, -1)
            .join(".")
          const fileName = `${fileNameNoSuffix}.parquet`
          setUploading({
            status: "converting",
            filename: fileName,
          })
        }

        return 1
      } catch (e) {
        errors.push({ file, e })
      }

      return null
    }



  const [totalTimeoutDuration, setTotalTimeoutDuration] = useState(0)
  const [timeoutFn, setTimeoutFn] = useState<any>(null)
  const incrementTimeoutFn = () =>
    setTotalTimeoutDuration((prev) => prev + TIMEOUT_INTERVAL)

  const checkIfConversionFinished = async (key: string) => {
    const statusFileName = key.replace("__dataset__", "__status__")
    const fileUrl = new URL(getFileUrl(statusFileName))
    const metadataResponse = await fetch(fileUrl.toString())
    const data = await metadataResponse.json()
    return data
  }

  useEffect(() => {
    let statusName = uploading?.filename
    statusName = statusName.replace("__dataset__", "__status__")
    statusName = statusName.replace("__toconvert__", "")
    statusName = statusName.replace(".parquet", ".json")

    let parquetName = uploading?.filename
    parquetName = parquetName.replace("__toconvert__", "")

    switch (uploading.status) {
      case "failed":
        console.error("File upload failed")
        break
      case "uploaded":
        uploading?.filename && handleMeta(uploading.filename)
        break
      case `converting`:
        console.log("checking status....", totalTimeoutDuration)
        uploading?.filename &&
          setTimeoutFn(
            setTimeout(
              () =>
                checkIfConversionFinished(statusName).then((data) => {
                  if (data?.body) {
                    try {
                      setTimeout(() => {
                        console.log("querying meta....")
                        handleMeta(parquetName)
                      }, 10000)
                    } catch (e) {
                      console.error(e)
                      setTimeout(() => {
                        console.log("querying meta....")
                        handleMeta(parquetName)
                      }, 3000)
                    }
                    clearTimeout(timeoutFn)
                  } else if (totalTimeoutDuration >= TIMEOUT_TOTAL_DURATION) {
                    setUploading({
                      status: "failed",
                      filename: uploading.filename,
                    })
                  } else {
                    incrementTimeoutFn()
                  }
                }),
              TIMEOUT_INTERVAL
            )
          )
        break
      default:
        break
    }
    
    () => clearTimeout(timeoutFn)
  }, [
    uploading?.filename,
    dataset?.status,
    totalTimeoutDuration,
    uploading.status,
  ])
  if (emptyViewIsShown) {
    return (
      <EmptyView
        title={
          "Click on the left side list to display Datasets details or create a..."
        }
        action={
          <ButtonDefault onClick={handleNewDataset}>
            <ButtonIcon icon={<AddIcon />} /> {"New Dataset"}
          </ButtonDefault>
        }
      />
    )
  }
  return (
    <Form data={dataset} onSubmit={onSubmit}> 
      {({ form, data, submit, Bind }) => (
        <SimpleForm>
          {loading && <CircularProgress />}
          <SimpleFormHeader title={data.title || 'New Dataset'} />
          {(uploading.status === 'not uploaded') ? (
            <FileUploader uploading={uploading} uploadFile={uploadFile(form)} form={form} />
          ) : 
          (uploading.status === "uploaded") ? 
            (null)
          :(
            <div style={{position: "absolute", left: '0', top: '0', width: '100%', height:'100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <h3 style={{fontWeight: "bold", textTransform: "uppercase"}}>{uploading.status}, please wait...</h3>
            </div>
          )}

          <SimpleFormContent>
            <Grid>
              <Cell span={10}>
                <Bind name="title" validators={validation.create('required')}>
                  <Input label={'Title'} />
                </Bind>
              </Cell>
              <Cell span={0} style={{ display: 'none' }}>
                <Bind name="filename" validators={validation.create('required')}>
                  <Input label={'File'} disabled />
                </Bind>
              </Cell>
              <Cell span={2}>
                <TablePreview table={table} />
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
                  {({ value }) => {
                    const onChangeColumns = (value: object) => {
                      form.setValue('columns', value)
                    }

                    return <ColumnBuilder columns={value || []} onChange={onChangeColumns} />
                  }}
                </Bind>
              </Cell>
            </Grid>
          </SimpleFormContent>
          {Boolean(uploading.status === "uploaded" || Boolean(dataset)) && <SimpleFormFooter>
            <ButtonDefault onClick={cancelEditing}>Cancel</ButtonDefault>
            <ButtonPrimary
              onClick={ev => {
                submit(ev)
              }}
            >
              Save Dataset
            </ButtonPrimary>
          </SimpleFormFooter>}
        </SimpleForm>
      )}
    </Form>
  )
}

export default DatasetsForm
