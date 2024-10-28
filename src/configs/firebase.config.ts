// firebase.config.ts
var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket:
    process.env.FIREBASE_STORAGE_BUCKET || "booksaddicted-3f1d5.appspot.com",
});

// Firebase Storage'ı dışa aktar
const bucket = admin.storage().bucket();
export { admin, bucket };
