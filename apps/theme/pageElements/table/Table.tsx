import React from 'react'
import { createRenderer, useRenderer } from '@webiny/app-page-builder-elements'
import { getApiUrl } from '../utils/dataApiUrl'
import useFullBundle from '../hooks/useFullBundle'
import useHtmlElementRerender from '../hooks/useHtmlElementRerender'
export interface TableProps {
  variables: {
    source: string
    columns?: Array<string>
  }
}
// @ts-ignore
export const Table = createRenderer(() => {
  const { getElement } = useRenderer()
  useFullBundle()
  const element = getElement<TableProps>()
  const { source, columns } = element.data.variables
  return useHtmlElementRerender(
    <osl-table
      data={getApiUrl(source)}
      columns={`${columns ? JSON.stringify(columns) : ''}`}
    ></osl-table>,
    [JSON.stringify(element.data.variables)]
  )
})

// define global html element table
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'osl-table': any
    }
  }
}
