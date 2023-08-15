import React, { useEffect, useState } from 'react'
import { request } from 'graphql-request'
import { createRenderer, useRenderer } from '@webiny/app-page-builder-elements'
import { getApiUrl } from '../utils/dataApiUrl'
export interface TableProps {
  variables: {
    source: string
  }
}

export const Table = createRenderer(() => {
  const { getElement } = useRenderer()
  const element = getElement<TableProps>()
  const { source } = element.data.variables

  useEffect(() => {
    const script = document.createElement('script')

    script.src = 'https://www.unpkg.com/@open-spatial-lab/table@0.0.0/dist/table.es.js'
    script.async = true
    script.type = 'module'

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return <osl-table data={getApiUrl(source)}></osl-table>
})

// define global html element table
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'osl-table': any
    }
  }
}
