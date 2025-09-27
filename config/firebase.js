// config/firebase.js
// This file initializes Firebase Admin SDK using env vars.
// It does defensive checks and helpful error messages.

const admin = require("firebase-admin");

// Make sure dotenv has been loaded earlier (we also load it here defensively)
require("dotenv").config();

// Helper to show masked value for logs
const mask = (s = "") => {
  if (!s) return "<<missing>>";
  if (s.length <= 8) return "<<set>>";
  return `${s.slice(0, 4)}...${s.slice(-4)}`;
};

// Required env vars list
const required = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_PRIVATE_KEY",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_STORAGE_BUCKET",
];

const missing = required.filter(
  (k) => !process.env[k] || process.env[k].trim() === ""
);
if (missing.length) {
  console.error(
    "ERROR: Missing required Firebase env vars:",
    missing.join(", ")
  );
  // If you want to allow running without firebase in dev, comment next line:
  process.exit(1);
}

// Read and sanitize private key.
// Developers sometimes put the key wrapped in quotes in .env. Remove surrounding quotes if present.
let rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

// If env contains real newline characters, keep them. If it contains \n sequences, convert them.
if (rawPrivateKey.startsWith('"') && rawPrivateKey.endsWith('"')) {
  rawPrivateKey = rawPrivateKey.slice(1, -1);
}
if (rawPrivateKey.startsWith("'") && rawPrivateKey.endsWith("'")) {
  rawPrivateKey = rawPrivateKey.slice(1, -1);
}

// Replace escaped \n with actual newlines (only if \n sequences exist)
const privateKey = rawPrivateKey.includes("\\n")
  ? rawPrivateKey.replace(/\\n/g, "\n")
  : rawPrivateKey;

// Basic validation of PEM format (very small check)
if (!privateKey.includes("BEGIN PRIVATE KEY")) {
  console.error(
    "ERROR: FIREBASE_PRIVATE_KEY does not look like a valid private key. Make sure you replaced line breaks with \\n in .env or provided the correct key."
  );
  process.exit(1);
}

// Build service account object
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: privateKey,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

// Initialize Firebase Admin
try {
  // Prevent re-initialization if hot-reloading / tests call this multiple times
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    console.log("Firebase initialized successfully:");
    console.log(" project_id:", mask(process.env.FIREBASE_PROJECT_ID));
    console.log(" client_email:", mask(process.env.FIREBASE_CLIENT_EMAIL));
    console.log(" storage_bucket:", mask(process.env.FIREBASE_STORAGE_BUCKET));
  } else {
    console.log("Firebase already initialized.");
  }

  const bucket = admin.storage().bucket();
  const auth = admin.auth();

  module.exports = { bucket, auth };
} catch (error) {
  console.error(
    "Error initializing Firebase:",
    error && error.message ? error.message : error
  );
  process.exit(1);
}
