const admin = require("firebase-admin");

var serviceAccount = require("./../../losetogain-8d719-firebase-adminsdk-z9wcf-380b0c7d90.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://losetogain-8d719-default-rtdb.firebaseio.com",
});

// Export both admin and database instance
const db = admin.firestore();

module.exports = { admin, db };
