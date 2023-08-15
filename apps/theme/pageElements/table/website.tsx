import { PbRenderElementPlugin } from '@webiny/app-page-builder/types'
import { Table } from './Table'

const plugin = {
  name: 'pb-render-page-element-table',
  type: 'pb-render-page-element',
  elementType: 'table',
  render: Table
} as PbRenderElementPlugin

export default plugin
