import corsHeaders from "../../utils/corsHeaders"

export const handleMissingId = (event: any) =>{ 
  return {
    statusCode: 400,
    headers: {
      ...corsHeaders
    },
    body: JSON.stringify({
      message: 'Invalid request. Please send a request followed by an ID.',
      request: {
        event
      }
    })
  }
}