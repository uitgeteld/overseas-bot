dotenv.config();

import * as fs from "fs";
import * as path from "path";
import { Client } from "discord.js";
import dotenv from "dotenv";

export function loadStartOptions(client: Client) {
  const optionsPath = path.join(__dirname, "../startOptions.json");
  try {
    const optionsData = fs.readFileSync(optionsPath, "utf-8");
    client.startOptions = JSON.parse(optionsData);
  } catch (error) {
    console.log("No startOptions.json found, using defaults");
    client.startOptions = {
      gitPull: true,
      npmInstall: true,
    };
  }
}

const { TOKEN, CLIENT_ID, GITHUB_TOKEN } = process.env;

if (!TOKEN || !CLIENT_ID || !GITHUB_TOKEN) {
  throw new Error("Missing environment variables");
}

export const config = {
  TOKEN,
  CLIENT_ID,
  GITHUB_TOKEN
};
