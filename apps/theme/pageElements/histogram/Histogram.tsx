import React from 'react'
import { createRenderer, useRenderer } from '@webiny/app-page-builder-elements'
import useFullBundle from '../hooks/useFullBundle'
import useHtmlElementRerender from '../hooks/useHtmlElementRerender'
import { getApiUrl } from '../utils/dataApiUrl'

export interface HistogramProps {
  variables: {
    source: string
    x: string
    fill?: string
    fx?: string
    fy?: string
  }
}

// @ts-ignore
export const Histogram = createRenderer(() => {
  const { getElement } = useRenderer()
  useFullBundle()
  const element = getElement<HistogramProps>()
  const { source, x, fill, fx, fy } = element.data.variables

  return useHtmlElementRerender(
    <osl-plot colorLegend="true" data={getApiUrl(source)}>
      <osl-histogram-plot {...{ x, fill, fx, fy }}></osl-histogram-plot>
    </osl-plot>,
    [source, x, , fill, fx, fy]
  )
})

// define global html element table
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'osl-plot': any
      'osl-histogram-plot': any
    }
  }
}
