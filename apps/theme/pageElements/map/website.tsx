import { PbRenderElementPlugin } from '@webiny/app-page-builder/types'
import { Map } from './Map'

const plugin = {
  name: 'pb-render-page-element-map',
  type: 'pb-render-page-element',
  elementType: 'map',
  render: Map
} as PbRenderElementPlugin

export default plugin
