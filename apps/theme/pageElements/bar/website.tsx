import { PbRenderElementPlugin } from '@webiny/app-page-builder/types'
import { Bar } from './Bar'

const plugin = {
  name: 'pb-render-page-element-bar',
  type: 'pb-render-page-element',
  elementType: 'bar',
  render: Bar
} as PbRenderElementPlugin

export default plugin
