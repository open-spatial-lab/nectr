import React from 'react'
import { validation } from '@webiny/validation'
import { Input } from '@webiny/ui/Input'
import { ButtonPrimary } from '@webiny/ui/Button'
import { Cell, Grid } from '@webiny/ui/Grid'
import { Select } from '@webiny/ui/Select'
import {
  PbEditorPageElementAdvancedSettingsPlugin,
  PbEditorPageElementPlugin
} from '@webiny/app-page-builder/types'

import { Table, TableProps } from './Table'
import { getApiUrl } from '../utils/dataApiUrl'

const INITIAL_ELEMENT_DATA: TableProps = {
  variables: {
    source: 'https://d3uldu0bz6pkei.cloudfront.net/data-query/64653de73263910008137327'
  }
}

export default [
  // The `PbEditorPageElementPlugin` plugin.
  {
    name: 'pb-editor-page-element-table',
    type: 'pb-editor-page-element',
    elementType: 'table',
    render: Table,
    toolbar: {
      // We use `pb-editor-element-group-media` to put our new
      // page element into the Media group in the left sidebar.
      title: 'table',
      group: 'pb-editor-element-group-media',
      preview() {
        // We can return any JSX / React code here. To keep it
        // simple, we are simply returning the element's name.
        return <>Table Page Element</>
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
        type: 'table',
        elements: [],
        data: INITIAL_ELEMENT_DATA,
        ...options
      }
    }
  } as PbEditorPageElementPlugin,

  // The `PbEditorPageElementAdvancedSettingsPlugin` plugin.
  {
    name: 'pb-editor-page-element-advanced-settings-table',
    type: 'pb-editor-page-element-advanced-settings',
    elementType: 'table',
    render({ data, Bind, submit }) {
      // In order to construct the settings form, we're using the
      // `@webiny/form`, `@webiny/ui`, and `@webiny/validation` packages.
      return (
        <>
          <Grid>
            <Cell span={12}>
              <Bind name={'variables.source'}>
                <Input
                  label={'Data Source'}
                  type="text"
                  description={'Data source to show in the table'}
                />
              </Bind>
            </Cell>
            <Cell span={12}>
              <p>Code Snippets</p>
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
<script src="https://www.unpkg.com/@open-spatial-lab/table@0.0.0/dist/table.es.js" async></script>

<osl-table data="${getApiUrl(data.variables.source)}"></osl-table>`}
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
