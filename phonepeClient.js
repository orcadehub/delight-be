// phonepeClient.js
import { StandardCheckoutClient, Env } from "pg-sdk-node";
import dotenv from "dotenv";
dotenv.config();

const clientId = process.env.PHONEPE_CLIENT_ID;
const clientSecret = process.env.PHONEPE_CLIENT_SECRET;
const clientVersion = 1;
const env = Env.PRODUCTION; // or Env.SANDBOX as needed

const client = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  env
);

export default client;
