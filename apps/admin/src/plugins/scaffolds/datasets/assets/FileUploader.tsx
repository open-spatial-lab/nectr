import React from 'react'
// @ts-ignore
import Files from 'react-butterfiles'
// import { dataFilesTypes } from "./constants";
// import * as Papa from "papaparse";
import { FileItem } from '@webiny/app-admin/components/FileManager/types'
import { ButtonIcon, ButtonPrimary } from '@webiny/ui/Button'
import { UploadIcon } from './uploadIcon'

type FileUploaderProps = {
  uploadFile: (files: FileItem) => Promise<number | null>
  form: any
  uploading: any
}

export const inferFileType = (filename: string) => {
  const ext = filename.split('.').pop()
  switch (ext) {
    case 'csv':
      return { extension: ext, contentType: 'text/csv' }
    case 'json':
      return { extension: ext, contentType: 'application/json' }
    case 'xml':
      return { extension: ext, contentType: 'application/xml' }
    case 'xls':
      return { extension: ext, contentType: 'application/vnd.ms-excel' }
    case 'parquet':
      return { extension: ext, contentType: 'application/parquet' }
    default:
      return { extension: ext, contentType: 'text/csv' }
  }
}

export const FileUploader: React.FC<FileUploaderProps> = ({ uploadFile, form, uploading }) => {
  
  return (
    <Files
      multiple={false}
      maxSize={'1TB'}
      multipleMaxSize={'1TB'}
      //    accept={dataFilesTypes}
      onSuccess={(files: any[]) => {
        console.log('received file', files[0])
        const title = files[0].name.split('.').slice(0, -1).join('.')
        uploadFile(files[0].src.file as FileItem)
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
        </>
      )}
    </Files>
  )
}
