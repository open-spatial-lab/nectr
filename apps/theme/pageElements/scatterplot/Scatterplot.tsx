import React from 'react'
import { createRenderer, useRenderer } from '@webiny/app-page-builder-elements'
import { getApiUrl } from '../utils/dataApiUrl'
import useFullBundle from '../hooks/useFullBundle'
import useHtmlElementRerender from '../hooks/useHtmlElementRerender'
export interface DotProps {
  variables: {
    source: string
    x: string
    y: string
    r?: string
    fill?: string
    fx?: string
    fy?: string
  }
}

// @ts-ignore
export const Scatterplot = createRenderer(() => {
  const { getElement } = useRenderer()
  useFullBundle()
  const element = getElement<DotProps>()
  const { source,x,y,fill,fx,fy,r } = element.data.variables

  return useHtmlElementRerender(
    <osl-plot
      colorLegend="true"
      xAxisAnchor="null"
      data={getApiUrl(source)}
    >
      <osl-dot-plot {...{x,y,fill,fx,fy,r}}></osl-dot-plot>
    </osl-plot>,
    [source,x,y,r,fill,fx,fy]
  )
})

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'osl-plot': any
      'osl-dot-plot': any
    }
  }
}
