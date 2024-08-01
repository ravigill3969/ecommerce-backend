import fs from "fs/promises";
import path from "path";
import process from "process";
import { authenticate } from "@google-cloud/local-auth";
import { google } from "googleapis";
import myCredentials from "../credentials.json" assert { type: "json" }; // Import the credentials JSON

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const TOKEN_PATH = path.join(process.cwd(), "token.json");

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH, "utf-8");
    const savedCredentials = JSON.parse(content);
    return google.auth.fromJSON(savedCredentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAuth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const key = myCredentials.web; // Use the imported credentials directly
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Authorize and send an email.
 *
 * @return {Promise<void>}
 */
export  async function sendEmail() {
  async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: path.join(process.cwd(), "myCredentials.json"),
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
    return client;
  }

  async function sendMessage(auth) {
    const gmail = google.gmail({ version: "v1", auth });
    const email = [
      'From: "Sender Name" <sender@example.com>',
      "To: recipient@example.com",
      "Subject: Test Email from Gmail API",
      "",
      "This is a test email sent using the Gmail API.",
    ].join("\n");

    const base64EncodedEmail = Buffer.from(email).toString("base64");
    const res = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: base64EncodedEmail
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, ""),
      },
    });
    console.log("Email sent:", res.data);
  }

  try {
    const authClient = await authorize();
    await sendMessage(authClient);
  } catch (error) {
    console.error("Error during Gmail API request:", error);
  }
}
