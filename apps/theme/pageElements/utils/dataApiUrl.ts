const BASE_URL = new URL(process.env['REACT_APP_API_URL']!).origin
export const getApiUrl = (id: string) => `${BASE_URL}/data-query/${id}`
export const getFileUrl = (file: string) => `${BASE_URL}/files/${file}`