import dotenv from "dotenv";

dotenv.config();

const { TOKEN, CLIENT_ID, GITHUB_TOKEN } = process.env;

if (!TOKEN || !CLIENT_ID || !GITHUB_TOKEN) throw new Error("Missing environment variables");

export const config = {
  TOKEN,
  CLIENT_ID,
  GITHUB_TOKEN
};
