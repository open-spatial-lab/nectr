import React from "react"
import { ButtonPrimary } from "@webiny/ui/Button"
import { Cell, Grid } from "@webiny/ui/Grid"
import { Select } from "@webiny/ui/Select"
import {
  PbEditorPageElementAdvancedSettingsPlugin,
  PbEditorPageElementPlugin,
} from "@webiny/app-page-builder/types"

import Chip from "@mui/material/Chip"
import { Input } from "@webiny/ui/Input"
import { Dropdown, SelectProps } from "./Dropdown"
import useDataViews from "../hooks/useDataViews"
import { fullBundleScriptText } from "../hooks/useFullBundle"
import { getApiUrl } from "../utils/dataApiUrl"

const INITIAL_ELEMENT_DATA: SelectProps = {
  variables: {
    source: "",
    option: "",
    options: [],
    defaultOption: "",
  },
}

export default [
  // The `PbEditorPageElementPlugin` plugin.
  {
    name: "pb-editor-page-element-dropdown",
    type: "pb-editor-page-element",
    elementType: "dropdown",
    render: Dropdown,
    toolbar: {
      // We use `pb-editor-element-group-media` to put our new
      // page element into the Media group in the left sidebar.
      title: "dropdown",
      group: "pb-editor-element-group-data",
      preview() {
        // We can return any JSX / React code here. To keep it
        // simple, we are simply returning the element's name.
        return <>Interactive: Dropdown</>
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
        type: "dropdown",
        elements: [],
        data: INITIAL_ELEMENT_DATA,
        ...options,
      }
    },
  } as PbEditorPageElementPlugin,

  // The `PbEditorPageElementAdvancedSettingsPlugin` plugin.
  {
    name: "pb-editor-page-element-advanced-settings-dropdown",
    type: "pb-editor-page-element-advanced-settings",
    elementType: "dropdown",
    render({ data, Bind, submit }) {
      const { dataViews, currentDataview } = useDataViews(data)
      const [chipText, setChipText] = React.useState("")
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
                    description={"Data source to show in the dropdown"}
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
            {!!data?.variables?.source && (
              <>
                <Cell span={12}>
                  <Bind name={"variables.option"}>
                    <Select
                      label={"Data View Filter Option"}
                      description={"Name of the data view filter to control"}
                    >
                      {currentDataview?.wheres.map((item: any, idx: number) => (
                        <option key={`${item}-view-${idx}`} value={item}>
                          {item}
                        </option>
                      ))}
                    </Select>
                  </Bind>
                </Cell>
                <Cell span={12}>
                  <Bind name={"variables.options"}>
                    {({ onChange }) => {
                      const currentOptions = data.variables.options
                      const handleAddOptions = (option: string | string[]) => {
                        if (Array.isArray(option)) {
                          onChange([...currentOptions, ...option])
                        } else {
                          onChange([...currentOptions, option])
                        }
                      }
                      const handleRemoveOptions = (option: string) => {
                        onChange(
                          currentOptions.filter(
                            (item: string) => item !== option
                          )
                        )
                      }

                      return (
                        <div>
                          {currentOptions.map((option: string) => (
                            <Chip
                              key={option}
                              label={option}
                              onDelete={() => {
                                handleRemoveOptions(option)
                              }}
                            />
                          ))}
                          <br />
                          <br />
                          <Input
                            label={"Add a new option"}
                            onChange={setChipText}
                            disabled={false}
                            value={chipText}
                            onEnter={() => {
                              if (chipText.includes(",")) {
                                console.log("splitting text")
                                const splitText = chipText
                                  .split(",")
                                  .map((item: string) => item.trim())
                                console.log(splitText)
                                handleAddOptions(splitText)
                              } else {
                                handleAddOptions(chipText)
                              }
                              setChipText("")
                            }}
                          />
                        </div>
                      )
                    }}
                  </Bind>
                </Cell>
                <Cell span={12}>
                  <Bind name={"variables.defaultOption"}>
                    <Select
                      label={"Default Option"}
                      description={"Default option to show"}
                    >
                      {data.variables.options?.map((item: any, idx: number) => (
                        <option key={`${item}-view-${idx}`} value={item}>
                          {item}
                        </option>
                      ))}
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

<osl-select-control
data="${getApiUrl(data.variables.source)}"    
options='${JSON.stringify(data.variables.options)}'
option="${data.variables.option}"
initialValue="${data.variables.defaultOption}"
>
</osl-select-control>`}
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
