import React from 'react'
import { createRenderer, useRenderer } from '@webiny/app-page-builder-elements'
import { getApiUrl } from '../utils/dataApiUrl'
import useFullBundle from '../hooks/useFullBundle'
import useHtmlElementRerender from '../hooks/useHtmlElementRerender'

export interface MapProps {
  variables: {
    source: string
    center: Array<number>
    zoom: number
    layerType: 'polygon' | 'scatter'
    geometryColumn: string
    choroplethColumn: string
  }
}

// @ts-ignore
export const Map = createRenderer(() => {
  const { getElement } = useRenderer()
  const element = getElement<MapProps>()
  useFullBundle()

  const { source, center, zoom, layerType, geometryColumn, choroplethColumn } =
    element.data.variables
  return useHtmlElementRerender(
    <osl-glmap
      center={JSON.stringify(center)}
      zoom={zoom}
      mapStyle="https://demotiles.maplibre.org/style.json"
    >
      <osl-map-layer
        layer={layerType}
        data={getApiUrl(source)}
        getPolygon={`(d) => d["${geometryColumn}"]`}
        choroplethColumn={choroplethColumn}
      ></osl-map-layer>
    </osl-glmap>,
    [JSON.stringify(element.data.variables)]
  )
})

// define global html element table
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'osl-glmap': any
      'osl-map-layer': any
    }
  }
}
