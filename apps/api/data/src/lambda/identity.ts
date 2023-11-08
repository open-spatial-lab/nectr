import jwkToPem from "jwk-to-pem"
import * as jwt from "jsonwebtoken"
import fetch from "node-fetch"
import { QueryResponse } from "../types/types"

const region = process.env["AWS_REGION"]
const userPoolId = process.env["COGNITO_USER_POOL_ID"]
const iss = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`

export async function verifyToken(
  token: string
): Promise<QueryResponse<string | jwt.JwtPayload, string>> {
  if (!token) {
    return {
      ok: false,
      error: "No token provided",
    }
  }
  const response = await fetch(
    `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`
  )
  const _jwkeys = (await response.json()) as { keys?: any[] }
  const jwkeys = _jwkeys.hasOwnProperty("keys") ? _jwkeys.keys : []
  if (!jwkeys || !jwkeys.length) {
    return {
      ok: false,
      error: "No keys found for cognito pool",
    }
  }
  const decodedJwt = jwt.decode(token, { complete: true })
  if (!decodedJwt) {
    return {
      ok: false,
      error: "Invalid token",
    }
  }
  const jwk = jwkeys.find((jwk) => jwk.kid === decodedJwt.header.kid)
  if (!jwk) {
    return {
      ok: false,
      error: "Invalid token - no matching jwk found",
    }
  }
  const pem = jwkToPem(jwk)
  try {
    jwt.verify(token, pem, { algorithms: ["RS256"] }, () => {})
    const decoded = jwt.verify(token, pem, { issuer: iss })
    return {
      ok: true,
      result: decoded,
    }
  } catch (err) {
    return {
      ok: false,
      error: JSON.stringify(err),
    }
  }
}
export const authorize = async (token?: string) => {
  if (!token) {
    return {
      ok: false,
      error:
        "Unauthorized - please provide a token in the X-Authorization header",
    }
  }

  const auth = await verifyToken(token)
  if (!auth.ok) {
    return {
      ok: false,
      error: "Not authorized",
    }
  }
  return {
    ok: true,
    result: auth.result,
  }
}
