import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { validation } from '@webiny/validation'
import { Input } from '@webiny/ui/Input'
import { ButtonDefault, ButtonPrimary } from '@webiny/ui/Button'
import { Cell, Grid } from '@webiny/ui/Grid'
import { Select } from '@webiny/ui/Select'
import { Slider } from '@webiny/ui/Slider'
import {
  PbEditorPageElementAdvancedSettingsPlugin,
  PbEditorPageElementPlugin
} from '@webiny/app-page-builder/types'
import { Switch } from '@webiny/ui/Switch'
import { LayerSpec, Map, MapProps } from './Map'
import { getApiUrl } from '../utils/dataApiUrl'
import useDataViews from '../hooks/useDataViews'
import { MAPSTYLES, BINNING_METHODS } from './utils'
import { Accordion, AccordionItem } from '@webiny/ui/Accordion'
import { Tabs, Tab } from '@webiny/ui/Tabs'
import { ConfirmationDialog } from '@webiny/ui/ConfirmationDialog'
import debounce from 'lodash/debounce'
import { colorSchemes, getColorScheme } from '../core/ColorSchemes'
import { BindComponent } from '@webiny/form'
import { Stack } from '@mui/material'
import { generateStringifiedHtml } from '../utils/generateStringifiedHtml'
import { create } from 'zustand'

interface MapGroupStore {
  mapGroups: { [key: string]: string }
  setMapGroup: (id: string, group: string) => void
  getMapCounts: () => { [key: string]: number }
}
const useMapGroupStore = create<MapGroupStore>(set => ({
  setMapGroup: (id: string, group: string) =>
    set(state => ({ mapGroups: { ...state.mapGroups, [id]: group } })),
  mapGroups: {},
  getMapCounts: () => {
    const counts: { [key: string]: number } = {}
    Object.values(useMapGroupStore.getState().mapGroups).forEach((group: string) => {
      counts[group] = counts[group] ? counts[group] + 1 : 1
    })
    return counts
  }
}))

const DEFAULT_LAYER: LayerSpec = {
  source: '',
  legendTitle: '',
  visible: true,
  geoType: 'WKB',
  geoColumn: '',
  dataColumn: '',
  type: 'continuous',
  bins: 5,
  colorScheme: 'RdYlGn',
  filled: true
}
const INITIAL_ELEMENT_DATA: MapProps = {
  variables: {
    mapStyle: MAPSTYLES[0].value,
    legendPosition: 'top-right',
    showNavigation: true,
    layers: [DEFAULT_LAYER]
  }
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
      group: 'pb-editor-element-group-data',
      preview() {
        // We can return any JSX / React code here. To keep it
        // simple, we are simply returning the element's name.
        return <>Map</>
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
        id: `${Math.random()}`,
        ...options
      }
    }
  } as PbEditorPageElementPlugin,

  // The `PbEditorPageElementAdvancedSettingsPlugin` plugin.
  {
    name: 'pb-editor-page-element-advanced-settings-map',
    type: 'pb-editor-page-element-advanced-settings',
    elementType: 'map',
    render({ data, Bind, submit, ...rest }) {
      const [timeoutFn, setTimeoutFn] = useState<ReturnType<typeof setTimeout> | null>(null)
      const mapStore = useMapGroupStore.getState()
      const mapGroups = mapStore?.getMapCounts() || {}
      const setMapGroup = (id: string) => mapStore?.setMapGroup?.(id, data.variables.mapGroup || '')

      const elementId = useMemo(() => {
        const id = `${Math.random()}}`
        setMapGroup(id)
        return id
      }, [])

      useEffect(() => {
        if (timeoutFn) {
          clearTimeout(timeoutFn)
        }
        setTimeoutFn(
          setTimeout(() => {
            submit()
            setMapGroup(elementId)
          }, 250)
        )
        return () => {
          if (timeoutFn) {
            clearTimeout(timeoutFn)
          }
        }
      }, [JSON.stringify(data.variables)])

      const [autoMapView, setAutoMapView] = useState<boolean>(true)
      let { layers, ...toStringify } = data.variables

      return (
        <>
          <Grid className="no-pad">
            <Cell span={12}>
              <Accordion className="no-pad">
                <AccordionItem
                  title="Map Settings"
                  description="Customize your overall map, view, and style."
                >
                  <Cell span={12}>
                    <h3>Initial Map View</h3>
                  </Cell>
                  <Cell span={12}>
                    <Bind name="variables">
                      {({ form, value, onChange }) => {
                        const handleChange = (autoMapView: boolean) => {
                          setAutoMapView(autoMapView)
                          const center = autoMapView ? undefined : [0, 0]
                          const zoom = autoMapView ? undefined : 0
                          try {
                            onChange({
                              ...value,
                              center,
                              zoom
                            })
                          } catch (e) {
                            console.log(e)
                          }
                        }
                        return (
                          <Switch
                            label={'Automatic Map View'}
                            onChange={handleChange}
                            value={autoMapView}
                            description={
                              'When your map loads, set the view to the extent of your data. Alternatively, you can set a manual center and zoom level.'
                            }
                          />
                        )
                      }}
                    </Bind>
                  </Cell>
                  {!autoMapView && (
                    <>
                      <Cell span={6}>
                        <Bind name="variables.center.0">
                          <Input label={'X / Longitude:'} type="number" disabled={autoMapView} />
                        </Bind>
                      </Cell>
                      <Cell span={6}>
                        <Bind name="variables.center.1">
                          <Input label={'Y / Longtide:'} type="number" disabled={autoMapView} />
                        </Bind>
                      </Cell>
                      <Cell span={12}>
                        <Bind name="variables.zoom">
                          <Input
                            label={'Map Zoom:'}
                            disabled={autoMapView}
                            description={'Choose the zoom level for the initial map view.'}
                            type="number"
                          />
                        </Bind>
                      </Cell>
                    </>
                  )}
                  <Cell span={12}>
                    <h3>Base Map Style</h3>
                  </Cell>
                  <Cell span={12}>
                    <Bind name="variables.mapStyle">
                      <Select
                        label={'Base Map Style:'}
                        description={'Choose the basemap to show underneath your data.'}
                      >
                        {MAPSTYLES.map((item, i) => (
                          <option key={i} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </Select>
                    </Bind>
                  </Cell>
                  {Object.entries(mapGroups)?.length > 1 ? (
                    <Cell className="padded-cell" span={12}>
                      <Bind name="variables.mapGroup">
                        <Select>
                          {Object.entries(mapGroups)?.map(([key, value], idx) => (
                            <option key={idx} value={key}>
                              {`${key} (${value} maps)`}
                            </option>
                          ))}
                        </Select>
                      </Bind>
                    </Cell>
                  ) : null}
                  <Cell className="padded-cell" span={12}>
                    <Bind name="variables.mapGroup">
                      <Input label="New Map Group" />
                    </Bind>
                  </Cell>
                </AccordionItem>
                <AccordionItem
                  title="Map Layers"
                  description="Add or customize data layers on your map."
                >
                  <Bind name="variables.layers">
                    {({ form, value: layers, onChange }) => {
                      const handleAdd = () => {
                        onChange([...layers, DEFAULT_LAYER])
                      }
                      const handleRemove = (idx: number) => {
                        onChange(layers.filter((_: LayerSpec, i: number) => i !== idx))
                      }

                      const getHandleChange = (idx: number) => (v: Partial<LayerSpec>) => {
                        const newLayers = layers.map((l: LayerSpec, i: number) => {
                          return i === idx
                            ? {
                                ...l,
                                ...v
                              }
                            : l
                        })
                        onChange(newLayers)
                      }

                      return (
                        <>
                          <ButtonPrimary onClick={handleAdd}>Add New Layer</ButtonPrimary>
                          <Tabs>
                            {layers.map((layer: LayerSpec, idx: number) => (
                              <Tab
                                label={layer.legendTitle ? layer.legendTitle : `Layer ${idx + 1}`}
                                key={idx}
                              >
                                <LayerConfigurator
                                  Bind={Bind}
                                  layer={layer}
                                  onChange={getHandleChange(idx)}
                                  index={idx}
                                  onRemove={() => handleRemove(idx)}
                                />
                              </Tab>
                            ))}
                          </Tabs>
                        </>
                      )
                    }}
                  </Bind>
                </AccordionItem>
                <AccordionItem title="Code Snippets">
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
<script src="https://www.unpkg.com/@open-spatial-lab/full-bundle" async type="module"></script>
${generateStringifiedHtml(
  'osl-glmap',
  toStringify,
  layers
    .map((l: LayerSpec) =>
      generateStringifiedHtml('osl-map-layer', { ...l, data: getApiUrl(l.source) })
    )
    .join('\n')
)}
                    `}
                  </pre>
                </AccordionItem>
              </Accordion>
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

export const LayerConfigurator = ({
  onChange,
  layer,
  index,
  onRemove,
  Bind
}: {
  onChange: (v: Partial<LayerSpec>) => void
  layer: LayerSpec
  index: number
  onRemove: () => void
  Bind: BindComponent
}) => {
  const baseMapLayers =
    (typeof document !== 'undefined' && Boolean(document))
    // @ts-ignore
      ? Object.keys(document?.getElementsByTagName('osl-glmap')?.[0]?.map?.style?._layers || {})
      : []
  const { dataViews, currentDataview } = useDataViews({ variables: { source: layer?.source } })
  const cleanColumnList = currentDataview?.columns || []
  const colorScheme = useMemo(
    () => getColorScheme(layer.colorScheme, layer.bins),
    [layer.colorScheme, layer.bins]
  )

  return (
    <div>
      <ConfirmationDialog
        title="Delete Layer"
        message="Are you sure you want remove this map layer?"
      >
        {({ showConfirmation }) => {
          return (
            <ButtonDefault
              onClick={() => {
                showConfirmation(onRemove, () => console.log('Cancel'))
              }}
            >
              Delete Layer
            </ButtonDefault>
          )
        }}
      </ConfirmationDialog>
      {/* legendTitle / title */}
      <Cell className="padded-cell" span={12}>
        <Input
          label={'Layer Title'}
          description={'Title to display in the legend.'}
          value={layer.legendTitle}
          onChange={legendTitle =>
            onChange({
              legendTitle
            })
          }
        />
      </Cell>
      {/* data attribution */}
      <Cell className="padded-cell" span={12}>
        <Input
          label={'Data Attribution:'}
          description={'Attribution to display on the map.'}
          value={layer.attribution}
          onChange={attribution =>
            onChange({
              attribution
            })
          }
        />
      </Cell>
      <Cell className="padded-cell" span={12}>
        {dataViews.length ? (
          <Select
            label={'Data Source'}
            description={'Data source to show in the map'}
            value={layer.source}
            onChange={source =>
              onChange({
                source
              })
            }
          >
            {dataViews?.map((item: any, idx: number) => (
              <option key={`${item.id}-view-${idx}`} value={item.id}>
                {item.title}
              </option>
            ))}
          </Select>
        ) : null}
      </Cell>
      <Cell className="padded-cell" span={12}>
        {cleanColumnList.length ? (
          <Select
            label={'Geometry Column:'}
            description={'Name of the data column that contains geometry.'}
            value={layer.geoColumn}
            onChange={geoColumn =>
              onChange({
                geoColumn
              })
            }
          >
            {cleanColumnList?.map((item: any, idx: number) => (
              <option key={`${item}-datacol-${idx}`} value={item}>
                {item}
              </option>
            ))}
          </Select>
        ) : null}
      </Cell>
      <Cell className="padded-cell" span={12}>
        <Bind name={`variables.layers.[${index}].geoType`}>
          <Select label={'Geometry Type:'} description={'The kind of map geometry in your data.'}>
            {/* 'WKB' | 'WKT' | 'GeoJSON' */}
            <option value="WKB">Well-Known-Binary (Default)</option>
            <option value="WKT">Well-Known-Text (WKT)</option>
            <option value="GeoJSON">GeoJSON</option>
          </Select>
        </Bind>
      </Cell>
      <Cell className="padded-cell" span={12}>
        <Bind name={`variables.layers.[${index}].layer`}>
          <Select label={'Layer Type:'} description={'Display point data or polygon geometries.'}>
            <option value="polygon">Polygon</option>
            <option value="point">Scaled Dots</option>
          </Select>
        </Bind>
      </Cell>
      <Cell className="padded-cell" span={12}>
        {cleanColumnList.length ? (
          <Select
            label={'Map Data Column (choropleth):'}
            description={'Name of the column to generate map colors from.'}
            value={layer.dataColumn}
            onChange={dataColumn =>
              onChange({
                dataColumn
              })
            }
          >
            {cleanColumnList?.map((item: any, idx: number) => (
              <option key={`${item}-datacol-${idx}`} value={item}>
                {item}
              </option>
            ))}
          </Select>
        ) : null}
      </Cell>
      {/* colorScheme */}
      <Cell className="padded-cell" span={12}>
        <Select
          label="Color scheme:"
          description="Choose a color scheme for your map."
          value={layer.colorScheme}
          onChange={colorScheme =>
            onChange({
              colorScheme
            })
          }
        >
          {Object.keys(colorSchemes).map((key: string, index: number) => {
            return (
              <option key={index} value={key}>
                {key}
              </option>
            )
          })}
        </Select>
      </Cell>
      {layer.type === "continuous" && <Cell className="padded-cell" span={12}>
        <p>Current Color Scheme:</p>
        <Stack direction="row" width={'100%'}>
          {colorScheme
            ? colorScheme?.map((color: string, idx: number) => {
                return (
                  <div
                    key={idx}
                    style={{
                      height: '10px',
                      width: '10px',
                      flexGrow: 1,
                      background: color,
                      margin: 0
                    }}
                  ></div>
                )
              })
            : null}
        </Stack>
      </Cell>}
      {/* categorical or continuous */}
      <Cell className="padded-cell" span={12}>
        <Bind name={`variables.layers.[${index}].type`}>
          <Select
            label={'Data Type:'}
            description={
              'Continuous maps draw colors based on a range of numbers. Categorical maps draw colors based on unique categories or values.'
            }
          >
            <option value="categorical">Categorical</option>
            <option value="continuous">Continuous</option>
            {/* <option value="ordinal">Ordinal</option> */}
          </Select>
        </Bind>
      </Cell>
      {/* bins 2 - 12 */}
      {layer.type === 'continuous' && (
        <>
          <Cell className="padded-cell" span={12}>
            <Bind name={`variables.layers.[${index}].bins`}>
              {/* number input */}
              <Input
                label={'Bins:'}
                description={'Number of color bins to use in the map.'}
                type="number"
              />
            </Bind>
          </Cell>
          {/* method */}
          <Cell className="padded-cell" span={12}>
            <Bind name={`variables.layers.[${index}].method`}>
              <Select
                label={'Binning Method:'}
                description={'Choose a method for binning your data.'}
              >
                {BINNING_METHODS.map((item, idx) => (
                  <option key={idx} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </Bind>
          </Cell>
        </>
      )}
      <Cell className="padded-cell" span={12}>
        <Bind name={`variables.layers.[${index}].beforeId`}>
          <Select
            label={'Data Overlay:'}
            description={'Choose a base map layer to place your data underneath.'}
          >
            {baseMapLayers.map((item, idx) => (
              <option key={idx} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </Bind>
      </Cell>
      <Cell className="padded-cell" span={12}>
        {cleanColumnList.length ? (
          <Bind name={`variables.layers.[${index}].geoId`}>
            <Select
              label={'Id Column (optional):'}
              description={
                'A column with an ID code, like a postal code or FIPS code, helpful for faster maps.'
              }
            >
              {cleanColumnList?.map((item: any, idx: number) => (
                <option key={`${item}-datacol-${idx}`} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </Bind>
        ) : null}
      </Cell>
      {/* visible switch */}
      <Cell className="padded-cell" span={12}>
        <Bind name={`variables.layers.[${index}].visible`}>
          <Switch label={'Visible'} description={'Show or hide this layer on the map.'} />
        </Bind>
      </Cell>
      {/* filled */}
      <Cell className="padded-cell" span={12}>
        <Bind name={`variables.layers.[${index}].filled`}>
          <Switch label={'Filled'} description={'Fill the map geometry with color.'} />
        </Bind>
      </Cell>
      {/* stroked */}
      <Cell className="padded-cell" span={12}>
        <Bind name={`variables.layers.[${index}].stroked`}>
          <Switch label={'Stroked'} description={'Show the map geometry outline.'} />
        </Bind>
      </Cell>
    </div>
  )
}
