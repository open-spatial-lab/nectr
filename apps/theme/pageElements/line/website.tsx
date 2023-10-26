import { PbRenderElementPlugin } from "@webiny/app-page-builder/types"
import { LineChart } from "./LineChart"

const plugin = {
  name: "pb-render-page-element-line",
  type: "pb-render-page-element",
  elementType: "linechart",
  render: LineChart,
} as PbRenderElementPlugin

export default plugin
