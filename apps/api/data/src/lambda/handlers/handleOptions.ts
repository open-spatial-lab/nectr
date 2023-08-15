export const handleOptionsRequest = () => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, X-Api-Key, X-Authorization',
      'Access-Control-Expose-Headers':
        'Content-Type, Authorization, X-Api-Key, X-Authorization'
    },
    body: ''
  }
}