const admin = require("firebase-admin");

var serviceAccount = require("./../../serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://losetogain-8d719-default-rtdb.firebaseio.com",
});

// Export both admin and database instance
const db = admin.firestore();

module.exports = { admin, db };
