import { useCurrentAccessKey } from './useCurrentAccessKey'
import React from 'react'
import { config as appConfig } from '@webiny/app/config'
  
export const useClearCache = (id: string) => {
  const [isClearingCache, setIsClearingCache] = React.useState(false)
  const [lastCleared, setLastCleared] = React.useState<null | string>(null)

  const apiUrl = `${appConfig.getKey(
    'API_URL',
    process.env.REACT_APP_API_URL
  )}/data-query/${id}?__fresh__=true`

  const currentToken = useCurrentAccessKey()

  const clearCache = async () => {
    const tokenGood = Boolean(currentToken) && !isClearingCache
    if (!tokenGood) {
      return 
    }
    setIsClearingCache(true)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'X-Authorization': currentToken as string
      }
    })
    if (!response.ok) {
      const error = await response.json()
      console.error(error)
    } else {
      const current = new Date()
      setLastCleared(current.toLocaleString())
      setIsClearingCache(false)
    }
  }

  return {
    lastCleared,
    isClearingCache,
    clearCache
  }
}
