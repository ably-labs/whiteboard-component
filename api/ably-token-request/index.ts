import * as dotenv from "dotenv";
import * as Ably from "ably/promises";
import { HandlerEvent, HandlerContext } from "@netlify/functions";

dotenv.config();

export async function handler(event: HandlerEvent, context: HandlerContext) {
  const clientId = event.queryStringParameters["clientId"] || process.env.DEFAULT_CLIENT_ID || "NO_CLIENT_ID";
  const client = new Ably.Rest(process.env.ABLY_API_KEY);
  const tokenRequestData = await client.auth.createTokenRequest({ clientId: clientId});
  
  return { 
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(tokenRequestData)
  }
}
