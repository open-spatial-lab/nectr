import { PbRenderElementPlugin } from '@webiny/app-page-builder/types'
import { Scatterplot } from './Scatterplot'

const plugin = {
  name: 'pb-render-page-element-scatterplot',
  type: 'pb-render-page-element',
  elementType: 'scatterplot',
  render: Scatterplot
} as PbRenderElementPlugin

export default plugin
