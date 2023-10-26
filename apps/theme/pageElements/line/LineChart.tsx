import React from "react"
import { createRenderer, useRenderer } from "@webiny/app-page-builder-elements"
import useFullBundle from "../hooks/useFullBundle"
import useHtmlElementRerender from "../hooks/useHtmlElementRerender"
import { getApiUrl } from "../utils/dataApiUrl"

export interface LineChartProps {
  variables: {
    source: string
    x: string
    y: string
    direction: "horizontal" | "vertical"
  }
}

// @ts-ignore
export const LineChart = createRenderer(() => {
  const { getElement } = useRenderer()
  useFullBundle()
  const element = getElement<LineChartProps>()
  const { source, x, y, direction } = element.data.variables

  return useHtmlElementRerender(
    <osl-plot colorLegend="true" data={getApiUrl(source)}>
      <osl-line {...{ x, y, direction }}></osl-line>
    </osl-plot>,
    [source, x, y, direction]
  )
})

// define global html element table
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "osl-plot": any
      "osl-line": any
    }
  }
}
