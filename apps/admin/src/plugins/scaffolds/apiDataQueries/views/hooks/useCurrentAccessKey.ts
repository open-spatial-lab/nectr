import { useSecurity } from '@webiny/app-security/hooks/useSecurity'

const findCurrentTokenWithId = (id?: string) => {
  if (!id || typeof localStorage === 'undefined') {
    return
  }
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('CognitoIdentityServiceProvider') && key.endsWith('userData')) {
      const text = localStorage.getItem(key) || ''
      const token = JSON.parse(text)
      if (token?.UserAttributes?.find((attr: any) => attr.Name === 'sub')?.Value === id) {
        const accessToken = localStorage.getItem(key.replace('userData', 'accessToken'))
        return accessToken || ''
      }
    }
  }
  return ''
}

export const useCurrentAccessKey = () => {
  const security = useSecurity()
  const { identity } = security
  return findCurrentTokenWithId(identity?.id)
}