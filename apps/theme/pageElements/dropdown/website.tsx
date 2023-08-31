import { PbRenderElementPlugin } from '@webiny/app-page-builder/types'
import { Dropdown } from './Dropdown'

const plugin = {
  name: 'pb-render-page-element-dropdown',
  type: 'pb-render-page-element',
  elementType: 'dropdown',
  render: Dropdown
} as PbRenderElementPlugin

export default plugin
