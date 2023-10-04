import { colorBrewerSchemes } from './colorBrewer';
import {d3Scales} from "./d3-color";
export const colorSchemes = {
  ...colorBrewerSchemes,
  ...d3Scales
} as const

export const getColorScheme = (_scheme?: string, bins?: number) => {
  if (!_scheme || !bins || !(_scheme in colorSchemes)) {
    throw new Error(`Color scheme ${_scheme} not found`)
  }
  const scheme = _scheme as keyof typeof colorSchemes

  if (typeof colorSchemes[scheme] === 'function') {
    // 0 to 1 stepped on number of steps
    const step = 1 / (bins-1)
    const steps = Array.from({ length: bins }, (_, i) => i * step)
    const cFunc = colorSchemes[scheme]
    // @ts-ignore
    return steps.map(cFunc)
  } else if (typeof colorSchemes[scheme] === 'object') {
    // @ts-ignore
    return colorSchemes[scheme][bins] || []
  }
}