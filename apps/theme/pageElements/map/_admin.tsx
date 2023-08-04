import React, { useEffect, useState } from 'react'
import { validation } from '@webiny/validation'
import { Input } from '@webiny/ui/Input'
import { ButtonPrimary } from '@webiny/ui/Button'
import { Cell, Grid } from '@webiny/ui/Grid'
import { Select } from '@webiny/ui/Select'
import { Slider } from '@webiny/ui/Slider'
import {
  PbEditorPageElementAdvancedSettingsPlugin,
  PbEditorPageElementPlugin
} from '@webiny/app-page-builder/types'
import { request } from 'graphql-request'

import { Map, MapProps } from './Map'
import { getApiUrl } from '../utils/dataApiUrl'

const INITIAL_ELEMENT_DATA: MapProps = {
  variables: {
    source: '6466e8ee505b900008f2c80d',
    center: [0, 0],
    zoom: 0,
    layerType: 'polygon',
    geometryColumn: 'WKT',
    choroplethColumn: 'AWATER10'
  }
}

const GQL_API_URL = 'https://d15yl9qyw1y5mg.cloudfront.net/graphql'

// These are the necessary GraphQL queries we'll need in order to retrieve data.
const DATA_VIEWS_QUERY = `{
    apiDataQueries {
      listApiDataQueries {
        data {
          id
          title
          template
        }
      }
    }
  }`

const cleanColumnName = (columnName: string) => {
  // replace to followed by a number followed by a period with nothing, if it exists in the string
  return columnName.split('.')[1] || columnName
}
export default [
  // The `PbEditorPageElementPlugin` plugin.
  {
    name: 'pb-editor-page-element-map',
    type: 'pb-editor-page-element',
    elementType: 'map',
    render: Map,
    toolbar: {
      // We use `pb-editor-element-group-media` to put our new
      // page element into the Media group in the left sidebar.
      title: 'map',
      group: 'pb-editor-element-group-media',
      preview() {
        // We can return any JSX / React code here. To keep it
        // simple, we are simply returning the element's name.
        return <>Map Page Element</>
      }
    },

    // Defines which types of element settings are available to the user.
    settings: [
      'pb-editor-page-element-settings-delete',
      'pb-editor-page-element-settings-visibility',
      'pb-editor-page-element-style-settings-padding',
      'pb-editor-page-element-style-settings-margin',
      'pb-editor-page-element-style-settings-width',
      'pb-editor-page-element-style-settings-height',
      'pb-editor-page-element-style-settings-background'
    ],

    // Defines onto which existing elements our element can be dropped.
    // In most cases, using `["cell", "block"]` will suffice.
    target: ['cell', 'block'],
    onCreate: 'open-settings',

    // `create` function creates the initial data for the page element.
    create(options) {
      return {
        type: 'map',
        elements: [],
        data: INITIAL_ELEMENT_DATA,
        ...options
      }
    }
  } as PbEditorPageElementPlugin,

  // The `PbEditorPageElementAdvancedSettingsPlugin` plugin.
  {
    name: 'pb-editor-page-element-advanced-settings-map',
    type: 'pb-editor-page-element-advanced-settings',
    elementType: 'map',
    render({ data, Bind, submit }) {
      const [dataViews, setDataViews] = useState<{ id: string; title: string; template: string }[]>(
        []
      )
      useEffect(() => {
        // @ts-ignore
        request(GQL_API_URL, DATA_VIEWS_QUERY).then(({ apiDataQueries }) => {
          const mappedDatasets: any = apiDataQueries?.listApiDataQueries?.data?.map(
            (entry: any) => ({
              id: entry.id,
              title: entry.title,
              template: entry.template
            })
          )
          setDataViews(mappedDatasets)
        })
      }, [])
      const currentDataview = dataViews?.find((item: any) => item.id === data.variables.source)
      const currentColumns = currentDataview ? JSON.parse(currentDataview?.template)?.columns : []

      const cleanColumnList = currentColumns?.map((item: any) => ({
        name: cleanColumnName(item.name),
        type: item.type,
        id: item.aggregate
          ? item.name.includes('WKT')
            ? '&#39;mode(t1.&quot;WKT&quot;)&#39;'
            : `${item.aggregate}(${item.name})`
          : item.name
      }))

      console.log(cleanColumnList)

      return (
        <>
          <Grid>
            <Cell span={12}>
              <h3>Data Source</h3>
              <br />
              <p>
                <b>{currentDataview?.title || ''}</b>
              </p>
              <br />
              {data.variables.source && dataViews.length ? (
                <Bind name={'variables.source'}>
                  <Select label={'Data Source'} description={'Data source to show in the map'}>
                    {dataViews?.map((item: any, idx: number) => (
                      <option key={`${item.id}-view-${idx}`} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </Select>
                </Bind>
              ) : null}
            </Cell>
            <Cell span={12}>
              <h3>Initial Map View</h3>
            </Cell>
            <Cell span={6}>
              <Bind name="variables.center.0">
                <Input label={'X / Longitude:'} type="number" />
              </Bind>
            </Cell>
            <Cell span={6}>
              <Bind name="variables.center.1">
                <Input label={'Y / Longtide:'} type="number" />
              </Bind>
            </Cell>
            <Cell span={12}>
              <Bind name="variables.zoom">
                <Input
                  label={'Map Zoom:'}
                  description={'Choose the zoom level for the initial map view.'}
                  type="number"
                />
              </Bind>
            </Cell>
            <Cell span={12}>
              <h3>Map Layer</h3>
            </Cell>
            <Cell span={12}>
              <Bind name="variables.layerType">
                <Select
                  label={'Map type:'}
                  description={'Choose the type of map you would like to display.'}
                >
                  <option value="polygon">Polygon</option>
                  <option value="scatter">Point</option>
                </Select>
              </Bind>
            </Cell>
            <Cell span={12}>
              {cleanColumnList.length ? (
                <Bind name="variables.geometryColumn">
                  <Select
                    label={'Geometry Column:'}
                    description={'Name of the data column that contains geometry.'}
                  >
                    {cleanColumnList?.map((item: any, idx: number) => (
                      <option key={`${item.id}-geomcol-${idx}`} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </Bind>
              ) : null}
            </Cell>
            <Cell span={12}>
              {cleanColumnList.length ? (
                <Bind name="variables.choroplethColumn">
                  <Select
                    label={'Map Data Column (choropleth):'}
                    description={'Name of the column to generate map colors from.'}
                  >
                    {cleanColumnList?.map((item: any, idx: number) => (
                      <option key={`${item.id}-datacol-${idx}`} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </Select>
                </Bind>
              ) : null}
            </Cell>
            {/* TODO CODE SNIPPETS */}
            <Cell span={12}>
              <hr />
              <h3>Code Snippets</h3>
              <br />
              <p>
                <i>Copy and paste this code snippet into your page to display the table.</i>
              </p>
              <pre
                style={{
                  maxWidth: '100%',
                  background: 'lightgray',
                  overflow: 'hidden',
                  textOverflow: '',
                  padding: '0.5rem'
                }}
              >
                {`
<script src="https://www.unpkg.com/@open-spatial-lab/glmap@0.0.5/dist/glmap.es.js" async></script>
<osl-glmap
    center='${JSON.stringify(data.variables.center)}'
    zoom="${data.variables.zoom}"
    mapStyle="https://demotiles.maplibre.org/style.json"
    >
    <osl-map-layer
    layer="${data.variables.layerType}"
    data="${getApiUrl(data.variables.source)}"
    getPolygon="(d) => d['${data.variables.geometryColumn}']"
    choroplethColumn="${data.variables.choroplethColumn}"
    >
    </osl-map-layer>
</osl-glmap>`}
              </pre>
            </Cell>
            <Cell span={12}>
              <ButtonPrimary onClick={submit}>Save</ButtonPrimary>
            </Cell>
          </Grid>
        </>
      )
    }
  } as PbEditorPageElementAdvancedSettingsPlugin
]
