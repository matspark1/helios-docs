const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

/**
 * Syncs document access permissions from Firestore to Realtime Database
 * This ensures our Realtime DB security rules can check document access
 */
exports.syncDocumentAccess = functions.firestore
  .document("documents/{documentId}")
  .onWrite(async (change, context) => {
    const documentId = context.params.documentId;
    const rtdb = admin.database();

    // If document was deleted, remove access in Realtime DB
    if (!change.after.exists) {
      await rtdb.ref(`document-access/${documentId}`).remove();
      return null;
    }

    const documentData = change.after.data();
    const accessUpdates = {};

    // Add document owner
    accessUpdates[documentData.ownerId] = true;

    // Add users with shared access
    if (documentData.sharedWith && Array.isArray(documentData.sharedWith)) {
      documentData.sharedWith.forEach((share) => {
        accessUpdates[share.userId] = true;
      });
    }

    // Update Realtime DB
    await rtdb.ref(`document-access/${documentId}`).set(accessUpdates);

    return null;
  });

/**
 * Cleans up old data from Realtime Database
 * This is a scheduled function that runs daily
 */
exports.cleanupCollaborationData = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const rtdb = admin.database();
    const firestore = admin.firestore();

    // Get all documents with collaboration data
    const snapshot = await rtdb.ref("yjs-docs").once("value");
    const collaborationDocs = snapshot.val() || {};

    for (const docId in collaborationDocs) {
      // Check if document still exists in Firestore
      const firestoreDoc = await firestore
        .collection("documents")
        .doc(docId)
        .get();

      if (!firestoreDoc.exists) {
        // Document no longer exists, remove collaboration data
        await rtdb.ref(`yjs-docs/${docId}`).remove();
        await rtdb.ref(`document-access/${docId}`).remove();
      } else {
        // Clean up inactive clients (older than 24 hours)
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

        // Limit updates history to prevent excessive data usage
        const updates = collaborationDocs[docId]?.updates || {};
        const updateIds = Object.keys(updates).sort();

        // Keep only the last 100 updates
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

/**
 * Initialize document access when a document is created
 * This ensures Realtime DB permissions are set immediately
 */
exports.initDocumentAccess = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
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
    // Get document from Firestore
    const docRef = admin.firestore().collection("documents").doc(documentId);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      throw new functions.https.HttpsError("not-found", "Document not found");
    }

    const documentData = docSnapshot.data();

    // Check if the user has access
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

    // Manually sync access permissions
    const accessUpdates = {};

    // Add document owner
    accessUpdates[documentData.ownerId] = true;

    // Add users with shared access
    if (documentData.sharedWith && Array.isArray(documentData.sharedWith)) {
      documentData.sharedWith.forEach((share) => {
        accessUpdates[share.userId] = true;
      });
    }

    // Update Realtime DB
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
