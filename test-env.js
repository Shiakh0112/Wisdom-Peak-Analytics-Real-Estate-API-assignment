require("dotenv").config();

console.log("Environment Variables Check:");
console.log(
  "FIREBASE_PROJECT_ID:",
  process.env.FIREBASE_PROJECT_ID ? "✓ Loaded" : "✗ Missing"
);
console.log(
  "FIREBASE_PRIVATE_KEY:",
  process.env.FIREBASE_PRIVATE_KEY ? "✓ Loaded" : "✗ Missing"
);
console.log(
  "FIREBASE_CLIENT_EMAIL:",
  process.env.FIREBASE_CLIENT_EMAIL ? "✓ Loaded" : "✗ Missing"
);
console.log(
  "FIREBASE_STORAGE_BUCKET:",
  process.env.FIREBASE_STORAGE_BUCKET ? "✓ Loaded" : "✗ Missing"
);
