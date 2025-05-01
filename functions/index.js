const functions = require("firebase-functions");
const admin = require("firebase-admin");
const puppeteer = require("puppeteer");

admin.initializeApp();

exports.syncDocumentAccess = functions.firestore
  .document("documents/{documentId}")
  .onWrite(async (change, context) => {
    const documentId = context.params.documentId;
    const rtdb = admin.database();

    if (!change.after.exists) {
      await rtdb.ref(`document-access/${documentId}`).remove();
      return null;
    }

    const documentData = change.after.data();
    const accessUpdates = {};

    accessUpdates[documentData.ownerId] = true;

    if (documentData.sharedWith && Array.isArray(documentData.sharedWith)) {
      documentData.sharedWith.forEach((share) => {
        accessUpdates[share.userId] = true;
      });
    }

    await rtdb.ref(`document-access/${documentId}`).set(accessUpdates);

    return null;
  });

exports.cleanupCollaborationData = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const rtdb = admin.database();
    const firestore = admin.firestore();

    const snapshot = await rtdb.ref("yjs-docs").once("value");
    const collaborationDocs = snapshot.val() || {};

    for (const docId in collaborationDocs) {
      const firestoreDoc = await firestore
        .collection("documents")
        .doc(docId)
        .get();

      if (!firestoreDoc.exists) {
        await rtdb.ref(`yjs-docs/${docId}`).remove();
        await rtdb.ref(`document-access/${docId}`).remove();
      } else {
        const clients = collaborationDocs[docId]?.clients || {};
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        for (const clientId in clients) {
          const client = clients[clientId];
          const lastSeen = new Date(client.lastSeen);

          if (lastSeen < oneDayAgo) {
            await rtdb.ref(`yjs-docs/${docId}/clients/${clientId}`).remove();
            await rtdb.ref(`yjs-docs/${docId}/awareness/${clientId}`).remove();
          }
        }

        const updates = collaborationDocs[docId]?.updates || {};
        const updateIds = Object.keys(updates).sort();

        if (updateIds.length > 100) {
          const updatesToRemove = updateIds.slice(0, updateIds.length - 100);

          for (const updateId of updatesToRemove) {
            await rtdb.ref(`yjs-docs/${docId}/updates/${updateId}`).remove();
          }
        }
      }
    }

    return null;
  });

exports.initDocumentAccess = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { documentId } = data;

  if (!documentId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Document ID is required"
    );
  }

  try {
    const docRef = admin.firestore().collection("documents").doc(documentId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      throw new functions.https.HttpsError("not-found", "Document not found");
    }

    const documentData = docSnapshot.data();

    const hasAccess =
      documentData.ownerId === context.auth.uid ||
      documentData.sharedWith?.some(
        (share) => share.userId === context.auth.uid
      );

    if (!hasAccess) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "User does not have access to this document"
      );
    }

    const accessUpdates = {};

    accessUpdates[documentData.ownerId] = true;

    if (documentData.sharedWith && Array.isArray(documentData.sharedWith)) {
      documentData.sharedWith.forEach((share) => {
        accessUpdates[share.userId] = true;
      });
    }

    await admin
      .database()
      .ref(`document-access/${documentId}`)
      .set(accessUpdates);

    return { success: true };
  } catch (error) {
    console.error("Error initializing document access:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

exports.ensureDocumentSync = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const { documentId } = data;

  if (!documentId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Document ID is required"
    );
  }

  try {
    const accessRef = admin
      .database()
      .ref(`document-access/${documentId}/${context.auth.uid}`);
    const accessSnapshot = await accessRef.once("value");

    if (!accessSnapshot.exists() || !accessSnapshot.val()) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "User does not have access to this document"
      );
    }

    const stateVectorRef = admin
      .database()
      .ref(`yjs-docs/${documentId}/state-vector`);
    const stateVectorSnapshot = await stateVectorRef.once("value");

    if (!stateVectorSnapshot.exists()) {
      return { status: "needs_reconstruction" };
    }

    return {
      status: "success",
      hasStateVector: true,
    };
  } catch (error) {
    console.error("Error ensuring document sync:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});