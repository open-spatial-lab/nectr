import corsHeaders from "../../utils/corsHeaders"

export const handleOptionsRequest = () => {
  return {
    statusCode: 200,
    headers: {
      ...corsHeaders
    },
    body: ''
  }
}