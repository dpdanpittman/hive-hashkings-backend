const admin = require("firebase-admin");

const serviceAccount = require("./hashkings-c7886-firebase-adminsdk-ktn7w-2ad03e5645.json");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
})

module.exports.admin = admin