import React from 'react'
import { createRenderer, useRenderer } from '@webiny/app-page-builder-elements'
import useFullBundle from '../hooks/useFullBundle'
import useHtmlElementRerender from '../hooks/useHtmlElementRerender'
import { getApiUrl } from '../utils/dataApiUrl'

export interface BarProps {
  variables: {
    source: string,
    x: string
    y: string
    direction?: string
    fill?: string
    fx?: string
    fy?: string
  }
}

// @ts-ignore
export const Bar = createRenderer(() => {
  const { getElement } = useRenderer()
  useFullBundle()
  const element = getElement<BarProps>()
  const { source,x,y,direction,fill,fx,fy } = element.data.variables

  return useHtmlElementRerender(

    <span
      dangerouslySetInnerHTML={{
        __html: `<osl-plot
      colorLegend="true"
      data="${getApiUrl(source)}"
    >
      <osl-bar 
        x="${x}"
        y="${y}"
      ></osl-bar>
    </osl-plot>`}} >asdf</span>,
    [source,x,y,direction,fill,fx,fy]
  )
})

// define global html element table
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'osl-plot': any
      'osl-bar': any
    }
  }
}
