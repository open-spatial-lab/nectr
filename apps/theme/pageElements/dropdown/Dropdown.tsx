import React from 'react'
import { createRenderer, useRenderer } from '@webiny/app-page-builder-elements'
import { getApiUrl } from '../utils/dataApiUrl'
import useFullBundle from '../hooks/useFullBundle'
import useHtmlElementRerender from '../hooks/useHtmlElementRerender'

export interface SelectProps {
  variables: {
    source: string,
    option: string,
    options: string[],
    defaultOption: string
  }
}

// @ts-ignore
export const Dropdown = createRenderer(() => {
  const { getElement } = useRenderer()
  useFullBundle()
  const element = getElement<SelectProps>()
  const { source, options, defaultOption, option } = element.data.variables

  return useHtmlElementRerender(
    <osl-select 
    data={getApiUrl(source)}
    options={JSON.stringify(options)}
    option={option}
    defaultOption={defaultOption}
    ></osl-select>,
    [source, JSON.stringify(options), option, defaultOption]
  )
})

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'osl-select': any
    }
  }
}
