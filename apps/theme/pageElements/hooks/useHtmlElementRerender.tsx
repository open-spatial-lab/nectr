import React, {useEffect, useState} from 'react'

export default function useHtmlElementRerender(
  element: React.ReactNode,
  trigger: Array<any>
){
  const [htmlEl, setHtmlEl] = useState<React.ReactNode>(<div></div>)
  
  useEffect(() => {
    console.log('updating...')
    const updateEl = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setHtmlEl(<div></div>)
      Promise.resolve().then(() => {
        setHtmlEl(element)
      })
    }
    updateEl()
  }, trigger)

  return htmlEl
}