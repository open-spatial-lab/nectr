import React, { useEffect, useRef, useState } from 'react'
import { request } from 'graphql-request'
import { createRenderer, useRenderer } from '@webiny/app-page-builder-elements'
import { getApiUrl } from '../utils/dataApiUrl'
import { flushSync } from 'react-dom'

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
  const [htmlEl, setHtmlEl] = useState<null | React.ReactNode>(null)

  useEffect(() => {
    const script = document.createElement('script')

    script.src = 'https://www.unpkg.com/@open-spatial-lab/glmap@0.0.5/dist/glmap.es.js'
    script.async = true
    script.type = 'module'

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])
  const { source, center, zoom, layerType, geometryColumn, choroplethColumn } =
    element.data.variables
  useEffect(() => {
    const updateEl = async () => {
      await new Promise(resolve => setTimeout(resolve, 100))
      setHtmlEl(null)
      Promise.resolve().then(() => {
        setHtmlEl(
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
          </osl-glmap>
        )
      })
    }
    updateEl()
  }, [JSON.stringify(element.data.variables)])

  return htmlEl
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
