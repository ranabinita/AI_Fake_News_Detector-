/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();

// Cloud Function to check news and save history
exports.checkNews = functions.https.onRequest(async (req, res) => {
  try {
    // Get the ID token from Authorization header
    const authHeader = req.headers.authorization || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.split("Bearer ")[1] : null;

    if (!idToken) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify the ID token and get user UID
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get the news text from the request body
    const newsText = req.body.text;
    if (!newsText) {
      return res.status(400).json({ error: "Bad Request: 'text' field is required" });
    }

    // Dummy AI logic (replace with your model or API)
    const verdict = newsText.toLowerCase().includes("fake") ? "Fake News" : "Possibly Real";

    // Save the check result in Firestore under the user's history
    await db.collection("users").doc(uid).collection("history").add({
      text: newsText,
      verdict,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Respond with the verdict
    return res.json({ verdict });
  } catch (error) {
    console.error("Error in checkNews function:", error);
    return res.status(401).json({ error: "Unauthorized or Internal Error" });
  }
});
