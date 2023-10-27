import React from 'react'
import { createRenderer, useRenderer } from '@webiny/app-page-builder-elements'
import { getApiUrl } from '../utils/dataApiUrl'
import useFullBundle from '../hooks/useFullBundle'
import useHtmlElementRerender from '../hooks/useHtmlElementRerender'

export interface SelectProps {
  variables: {
    source: string
    option: string
    options: string[]
    defaultOption: string
  }
}

// @ts-ignore
export const Dropdown = createRenderer(() => {
  const { getElement } = useRenderer()
  useFullBundle()
  const element = getElement<SelectProps>()
  const { source, options, defaultOption, option } = element.data.variables
  console.log(option)
  return useHtmlElementRerender(
    <div>
      <osl-select-control
        data={getApiUrl(source)}
        options={JSON.stringify(options)}
        option={option}
        initialValue={defaultOption}
      ></osl-select-control>
    </div>,
    [JSON.stringify(element.data.variables)]
  )
})
function stringifyWithQuotes(obj: any): string {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'string') {
      return value.replace(/&quot;/g, '"')
    }
    return value
  })
}
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'osl-select-control': any
    }
  }
}
