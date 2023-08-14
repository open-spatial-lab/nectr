const DATA_API_URL = process.env.NODE_ENV == 'development' 
  ? 'http://d3uldu0bz6pkei.cloudfront.net/data-query/'
  : 'https://d3uldu0bz6pkei.cloudfront.net/data-query/'
export const getApiUrl = (id: string) => `${DATA_API_URL}${id}`