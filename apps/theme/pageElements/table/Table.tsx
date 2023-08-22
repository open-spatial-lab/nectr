import React from 'react'
import { createRenderer, useRenderer } from '@webiny/app-page-builder-elements'
import { getApiUrl } from '../utils/dataApiUrl'
import useFullBundle from '../hooks/useFullBundle'
import useHtmlElementRerender from '../hooks/useHtmlElementRerender'
export interface TableProps {
  variables: {
    source: string
  }
}
// @ts-ignore
export const Table = createRenderer(() => {
  const { getElement } = useRenderer()
  useFullBundle()
  const element = getElement<TableProps>()
  const { source } = element.data.variables
  return useHtmlElementRerender(<osl-table data={getApiUrl(source)}></osl-table>, [source])
})

// define global html element table
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'osl-table': any
    }
  }
}
