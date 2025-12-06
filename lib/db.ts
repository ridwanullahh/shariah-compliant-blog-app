// Bismillah Ar-Rahman Ar-Roheem
// Database instance configuration

import UniversalSDK from "./github-db-sdk"

// Singleton instance
let dbInstance: UniversalSDK | null = null

export function getDB(): UniversalSDK {
  if (!dbInstance) {
    dbInstance = new UniversalSDK({
      owner: process.env.GITHUB_DB_OWNER || "",
      repo: process.env.GITHUB_DB_REPO || "",
      token: process.env.GITHUB_DB_TOKEN || "",
      branch: process.env.GITHUB_DB_BRANCH || "main",
      basePath: "db",
      mediaPath: "media",
      cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
        apiKey: process.env.CLOUDINARY_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET,
      },
      nodemailer: process.env.GMAIL_USER
        ? {
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: process.env.GMAIL_USER || "",
              pass: process.env.GMAIL_APP_PASSWORD || "",
            },
            from: process.env.GMAIL_FROM || process.env.GMAIL_USER || "",
          }
        : undefined,
      auth: {
        requireEmailVerification: false,
        otpTriggers: [],
      },
    })
  }
  return dbInstance
}

// Initialize database on first load
export async function initializeDB(): Promise<UniversalSDK> {
  const db = getDB()
  await db.init()
  return db
}

export const db = getDB

export default getDB
