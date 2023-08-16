const DATA_API_URL = new URL(process.env['REACT_APP_API_URL']!).origin + '/data-query/'
export const getApiUrl = (id: string) => `${DATA_API_URL}${id}`