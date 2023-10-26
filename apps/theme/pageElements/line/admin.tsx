import React from "react"
import { ButtonPrimary } from "@webiny/ui/Button"
import { Cell, Grid } from "@webiny/ui/Grid"
import { Select } from "@webiny/ui/Select"
import {
  PbEditorPageElementAdvancedSettingsPlugin,
  PbEditorPageElementPlugin,
} from "@webiny/app-page-builder/types"

import { LineChart, LineChartProps } from "./LineChart"
import { getApiUrl } from "../utils/dataApiUrl"
import useDataViews from "../hooks/useDataViews"
import { fullBundleScriptText } from "../hooks/useFullBundle"

const INITIAL_ELEMENT_DATA: LineChartProps = {
  variables: {
    source: "",
    x: "",
    y: "",
    direction: "horizontal",
  },
}

export default [
  // The `PbEditorPageElementPlugin` plugin.
  {
    name: "pb-editor-page-element-line",
    type: "pb-editor-page-element",
    elementType: "linechart",
    render: LineChart,
    toolbar: {
      // We use `pb-editor-element-group-media` to put our new
      // page element into the Media group in the left sidebar.
      title: "linechart",
      group: "pb-editor-element-group-data",
      preview() {
        // We can return any JSX / React code here. To keep it
        // simple, we are simply returning the element's name.
        return <>Line Chart</>
      },
    },

    // Defines which types of element settings are available to the user.
    settings: [
      "pb-editor-page-element-settings-delete",
      "pb-editor-page-element-settings-visibility",
      "pb-editor-page-element-style-settings-padding",
      "pb-editor-page-element-style-settings-margin",
      "pb-editor-page-element-style-settings-width",
      "pb-editor-page-element-style-settings-height",
      "pb-editor-page-element-style-settings-background",
    ],

    // Defines onto which existing elements our element can be dropped.
    // In most cases, using `["cell", "block"]` will suffice.
    target: ["cell", "block"],
    onCreate: "open-settings",

    // `create` function creates the initial data for the page element.
    create(options) {
      return {
        type: "linechart",
        elements: [],
        data: INITIAL_ELEMENT_DATA,
        ...options,
      }
    },
  } as PbEditorPageElementPlugin,

  // The `PbEditorPageElementAdvancedSettingsPlugin` plugin.
  {
    name: "pb-editor-page-element-advanced-settings-linechart",
    type: "pb-editor-page-element-advanced-settings",
    elementType: "linechart",
    render({ data, Bind, submit }) {
      const { dataViews, currentDataview } = useDataViews(data)
      const columns = currentDataview?.columns || []
      // In order to construct the settings form, we're using the
      // `@webiny/form`, `@webiny/ui`, and `@webiny/validation` packages.

      return (
        <>
          <Grid>
            <Cell span={12}>
              <h3>Data Source</h3>
              <br />
              <p>
                <b>{currentDataview?.title || ""}</b>
              </p>
              <br />
              {dataViews.length ? (
                <Bind name={"variables.source"}>
                  <Select
                    label={"Data Source"}
                    description={"Data source to show in the bar chart"}
                  >
                    {dataViews?.map((item: any, idx: number) => (
                      <option key={`${item.id}-view-${idx}`} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                  </Select>
                </Bind>
              ) : null}
            </Cell>
            {!!columns?.length && (
              <>
                <Cell span={12}>
                  <h3>X Column</h3>
                  <br />
                  <Bind name={"variables.x"}>
                    <Select
                      label={"X Column"}
                      description={"Column for the X axis"}
                    >
                      {columns?.map((item: any, idx: number) => (
                        <option key={`${item}-view-${idx}`} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                  </Bind>
                </Cell>

                <Cell span={12}>
                  <h3>Y Column</h3>
                  <br />
                  <Bind name={"variables.y"}>
                    <Select
                      label={"Y Column"}
                      description={"Column for the y axis"}
                    >
                      {columns?.map((item: any, idx: number) => (
                        <option key={`${item}-view-${idx}`} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                  </Bind>
                </Cell>
                <Cell span={12}>
                  <h3>Facet Y</h3>
                  <br />
                  <Bind name={"variables.fy"}>
                    <Select
                      label={"Facet Y"}
                      description={
                        "Break out the data into sub-charts based on a column, vertically"
                      }
                    >
                      {columns?.map((item: any, idx: number) => (
                        <option key={`${item}-view-${idx}`} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                  </Bind>
                </Cell>
                <Cell span={12}>
                  <h3>Direction</h3>
                  <br />
                  <Bind name={"variables.direction"}>
                    <Select
                      label={"Direction"}
                      description={
                        "Lay out the line chart horizontally (default) or vertically"
                      }
                    >
                      <option value={"horizontal"}>Horizontal</option>
                      <option value={"vertical"}>Vertical</option>
                    </Select>
                  </Bind>
                </Cell>
              </>
            )}
            <Cell span={12}>
              <p>Code Snippets</p>
              <p>
                <i>
                  Copy and paste this code snippet into your page to display the
                  bar.
                </i>
              </p>
              <pre
                style={{
                  maxWidth: "100%",
                  background: "lightgray",
                  overflow: "hidden",
                  textOverflow: "",
                  padding: "0.5rem",
                }}
              >
                {`
${fullBundleScriptText}

<osl-plot
colorLegend="true" 
data="${getApiUrl(data.variables.source)}"    
>
<osl-line 
x="${data.variables.x}"
y="${data.variables.y}"
direction="${data.variables.direction}"
></osl-line>
</osl-plot>`}
              </pre>
            </Cell>
            <Cell span={12}>
              <ButtonPrimary onClick={submit}>Save</ButtonPrimary>
            </Cell>
          </Grid>
        </>
      )
    },
  } as PbEditorPageElementAdvancedSettingsPlugin,
]
