import React from 'react'
import { createRenderer, useRenderer } from '@webiny/app-page-builder-elements'
import { getApiUrl } from '../utils/dataApiUrl'
import useFullBundle from '../hooks/useFullBundle'
import useHtmlElementRerender from '../hooks/useHtmlElementRerender'
import { MAPSTYLES } from './utils'

export interface MapProps {
  variables: {
    mapStyle?: string
    center?: Array<number>
    zoom?: number
    legendPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    mapGroup?: string
    showNavigation?: boolean
    layers: Array<LayerSpec>
  }
}

export interface LayerSpec {
  source: string //
  legendTitle?: string //
  visible?: boolean //
  attribution?: string //
  beforeId?: string
  colorScheme?: string //
  geoId?: string //
  geoType: 'WKB' | 'WKT' | 'GeoJSON' //
  geoColumn: string //
  dataColumn: string //
  type: 'categorical' | 'continuous' | 'ordinal'
  filled?: boolean //
  stroked?: boolean //
  circleRadius?: number | string
  radiusUnits?: 'meters' | 'pixels'
  method?: 'EQI' | 'STD' | 'APG' | 'QNT' | 'JNK' //
  bins?: number //
  manualBreaks?: Array<number>
  mapping?: Array<{
    [key: string]: string
  }>
}

// @ts-ignore
export const Map = createRenderer(() => {
  const { getElement } = useRenderer()
  const element = getElement<MapProps>()
  useFullBundle()

  const { center, zoom, mapStyle, mapGroup, layers } = element.data.variables

  return useHtmlElementRerender(
    <osl-glmap
      center={center ? JSON.stringify(center) : undefined}
      zoom={zoom !== undefined ? zoom : undefined}
      mapStyle={mapStyle || MAPSTYLES[0].value}
      mapGroup={mapGroup}
    >
      {layers.map((layer, index) => {
        return (
          <osl-map-layer
            key={index}
            data={getApiUrl(layer.source)}
            legendTitle={layer.legendTitle}
            visible={layer.visible}
            attribution={layer.attribution}
            beforeId={layer.beforeId}
            colorScheme={layer.colorScheme}
            geoId={layer.geoId}
            geoType={layer.geoType}
            geoColumn={layer.geoColumn}
            dataColumn={layer.dataColumn}
            type={layer.type}
            filled={layer.filled}
            stroked={layer.stroked}
            circleRadius={layer.circleRadius}
            radiusUnits={layer.radiusUnits}
            method={layer.method}
            bins={layer.bins}
            manualBreaks={layer.manualBreaks}
            mapping={layer.mapping}
          />
        )
      })}
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
