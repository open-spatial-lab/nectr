export const handleMissingId = (event: any) =>{ 
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Invalid request. Please send a request followed by an ID.',
      request: {
        event
      }
    })
  }
}