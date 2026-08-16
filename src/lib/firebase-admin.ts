import admin from "firebase-admin";

function getAdminApp(): admin.app.App {
  if (admin.apps.length) return admin.apps[0]!;

  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!privateKey) throw new Error("FIREBASE_ADMIN_PRIVATE_KEY is not set");

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey:  privateKey.replace(/\\n/g, "\n"),
    }),
    // Without this, storage().bucket() has no default and throws
    // "Bucket name not specified or invalid". The NEXT_PUBLIC_ value is
    // inlined at build time but is also readable here on the server.
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export function getAdminAuth()      { return admin.auth(getAdminApp()); }
export function getAdminDb()        { return admin.firestore(getAdminApp()); }
export function getAdminMessaging() { return admin.messaging(getAdminApp()); }
export function getAdminStorage()   { return admin.storage(getAdminApp()); }
