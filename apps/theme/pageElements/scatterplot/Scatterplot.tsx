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
  const { source, x, y, fill, fx, fy, r } = element.data.variables

  return useHtmlElementRerender(
    <span
      dangerouslySetInnerHTML={{
        __html: `<osl-plot
      colorLegend="true"
      data="${getApiUrl(source)}"
    >
      <osl-dot-plot
        x="${x}"
        y="${y}"
        ${fill && `fill="${fill}"`}
        ${fx && `fx="${fx}"`}
        ${fy && `fy="${fy}"`}
        ${r && `r="${r}"`}
      ></osl-dot-plot>
    </osl-plot>`
      }}
    />,
    [source, x, y, r, fill, fx, fy]
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
