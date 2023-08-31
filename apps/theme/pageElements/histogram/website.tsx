import { PbRenderElementPlugin } from '@webiny/app-page-builder/types'
import { Histogram } from './Histogram'

const plugin = {
  name: 'pb-render-page-element-histogram',
  type: 'pb-render-page-element',
  elementType: 'histogram',
  render: Histogram
} as PbRenderElementPlugin

export default plugin
