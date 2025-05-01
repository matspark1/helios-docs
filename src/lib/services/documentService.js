import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { ref, set, get, remove } from "firebase/database";
import { auth, db, rtdb } from "../FirebaseConfig";
import toast from "svelte-5-french-toast";

// Function to update lastOpenedAt timestamp
async function updateLastOpenedTimestamp(documentId) {
  try {
    const user = auth.currentUser;
    if (!user) return; // Don't update if not logged in

    const docRef = doc(db, "documents", documentId);
    await updateDoc(docRef, {
      lastOpenedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error updating last opened timestamp:", error);
    // Don't throw error here as this is a background operation
    return false;
  }
}

export async function getDocument(documentId) {
  try {
    const docRef = doc(db, "documents", documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Update the lastOpenedAt timestamp when document is accessed
      updateLastOpenedTimestamp(documentId);
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting document:", error);
    throw error;
  }
}

export async function createDocument(title = "Untitled Document") {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be logged in to create a document");

    const docRef = doc(collection(db, "documents"));
    await setDoc(docRef, {
      title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastOpenedAt: serverTimestamp(), // Add lastOpenedAt field when creating document
      ownerId: user.uid,
      sharedWith: [],
    });

    const accessRef = ref(rtdb, `document-access/${docRef.id}`);
    await set(accessRef, {
      [user.uid]: true,
    });
    toast.success("A New Document Has Been Made");
    return docRef.id;
  } catch (error) {
    console.error("Error creating document:", error);
    toast.error("Error creating document. Please Try Again Later");
    throw error;
  }
}

export async function updateDocumentTitle(documentId, title) {
  try {
    const docRef = doc(db, "documents", documentId);
    await updateDoc(docRef, {
      title,
      updatedAt: serverTimestamp(),
      lastOpenedAt: serverTimestamp(), // Update lastOpenedAt when title is changed
    });

    return true;
  } catch (error) {
    console.error("Error updating document title:", error);
    throw error;
  }
}

export async function deleteDocument(documentId) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be logged in to delete a document");

    const docRef = doc(db, "documents", documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Document not found");
    }

    const docData = docSnap.data();

    if (docData.ownerId !== user.uid) {
      throw new Error("You don't have permission to delete this document");
    }

    await deleteDoc(docRef);

    const accessRef = ref(rtdb, `document-access/${documentId}`);
    await remove(accessRef);

    const yjsRef = ref(rtdb, `yjs-docs/${documentId}`);
    await remove(yjsRef);

    return true;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
}

export async function shareDocument(documentId, userEmail, role = "editor") {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", userEmail));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("User not found");
    }

    const userId = querySnapshot.docs[0].id;
    const docRef = doc(db, "documents", documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Document not found");
    }

    const docData = docSnap.data();
    if (docData.sharedWith && Array.isArray(docData.sharedWith)) {
      const isAlreadyShared = docData.sharedWith.some(
        (share) => share.userId === userId
      );
      if (isAlreadyShared) {
        throw new Error("This user already has access to the document");
      }
    }

    await updateDoc(docRef, {
      sharedWith: arrayUnion({ userId, role }),
      updatedAt: serverTimestamp(),
      lastOpenedAt: serverTimestamp(), 
    });

    const accessRef = ref(rtdb, `document-access/${documentId}/${userId}`);
    await set(accessRef, true);

        try {
          const functions = getFunctions();
          const ensureDocumentSync = httpsCallable(
            functions,
            "ensureDocumentSync"
          );
          await ensureDocumentSync({ documentId });
        } catch (syncError) {
          console.warn(
            "Document sync operation failed, but access was granted:",
            syncError
          );
        }

    return true;
  } catch (error) {
    console.error("Error sharing document:", error);
    throw error;
  }
}

export async function removeSharedUser(documentId, userId) {
  try {
    const docRef = doc(db, "documents", documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error("Document not found");
    }

    const docData = docSnap.data();
    const userShare = docData.sharedWith.find(
      (share) => share.userId === userId
    );

    if (!userShare) {
      throw new Error("User not found in shared list");
    }

    await updateDoc(docRef, {
      sharedWith: arrayRemove(userShare),
      updatedAt: serverTimestamp(),
      lastOpenedAt: serverTimestamp(), 
    });

    const accessRef = ref(rtdb, `document-access/${documentId}/${userId}`);
    await set(accessRef, null);

    return true;
  } catch (error) {
    console.error("Error removing shared user:", error);
    throw error;
  }
}

export async function checkDocumentAccess(documentId) {
  try {
    const user = auth.currentUser;
    if (!user) return { hasAccess: false, reason: "Not authenticated" };

    const docRef = doc(db, "documents", documentId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists())
      return { hasAccess: false, reason: "Document not found" };

    const docData = docSnap.data();

    if (docData.ownerId === user.uid) {
      const accessRef = ref(rtdb, `document-access/${documentId}/${user.uid}`);
      await set(accessRef, true);

      updateLastOpenedTimestamp(documentId);

      return { hasAccess: true, role: "owner" };
    }

    const sharedWith = docData.sharedWith || [];
    const userShare = sharedWith.find((share) => share.userId === user.uid);

    if (userShare) {
      const accessRef = ref(rtdb, `document-access/${documentId}/${user.uid}`);
      await set(accessRef, true);

      updateLastOpenedTimestamp(documentId);

      return { hasAccess: true, role: userShare.role };
    }

    return { hasAccess: false, reason: "No access to this document" };
  } catch (error) {
    console.error("Error checking document access:", error);
    return { hasAccess: false, error: error.message };
  }
}

export async function getUserDocuments() {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be logged in to view your documents");

    const ownedDocsQuery = query(
      collection(db, "documents"),
      where("ownerId", "==", user.uid)
    );

    const ownedDocsSnapshot = await getDocs(ownedDocsQuery);

    const ownedDocs = ownedDocsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      isOwner: true,
    }));

    const sharedDocsQuery = query(
      collection(db, "documents"),
      where("sharedWith", "array-contains", user.uid)
    );

    const sharedDocsSnapshot = await getDocs(sharedDocsQuery);

    const sharedDocs = sharedDocsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      isOwner: false,
    }));

    const allDocs = [...ownedDocs, ...sharedDocs];

    return allDocs;
  } catch (error) {
    console.error("Error getting user documents:", error);
    throw error;
  }
}

export async function cleanupOldDocumentData(documentId) {
  try {
    const updatesRef = ref(rtdb, `yjs-docs/${documentId}/updates`);
    const updatesSnapshot = await get(updatesRef);

    if (!updatesSnapshot.exists()) return;

    const updates = updatesSnapshot.val();
    const updateIds = Object.keys(updates).sort();

    // keep only the last 100 updates
    if (updateIds.length > 100) {
      const updatesToRemove = updateIds.slice(0, updateIds.length - 100);

      for (const updateId of updatesToRemove) {
        await set(
          ref(rtdb, `yjs-docs/${documentId}/updates/${updateId}`),
          null
        );
      }
    }

    // clean up inactive clients (older than 1 day)
    const clientsRef = ref(rtdb, `yjs-docs/${documentId}/clients`);
    const clientsSnapshot = await get(clientsRef);

    if (clientsSnapshot.exists()) {
      const clients = clientsSnapshot.val();
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      for (const clientId in clients) {
        const client = clients[clientId];
        const lastSeen = new Date(client.lastSeen);

        if (lastSeen < oneDayAgo) {
          await set(
            ref(rtdb, `yjs-docs/${documentId}/clients/${clientId}`),
            null
          );
          await set(
            ref(rtdb, `yjs-docs/${documentId}/awareness/${clientId}`),
            null
          );
        }
      }
    }

    return true;
  } catch (error) {
    console.error("Error cleaning up old document data:", error);
    return false;
  }
}

export async function getUserSharedDocuments() {
  try {
    const user = auth.currentUser;
    if (!user)
      throw new Error("You must be logged in to view shared documents");

    const sharedDocsQuery = query(
      collection(db, "documents"),
      where("sharedWith", "array-contains", {
        userId: user.uid,
        role: "editor",
      })
    );

    const sharedDocsSnapshot = await getDocs(sharedDocsQuery);

    if (sharedDocsSnapshot.empty) {
    } else {
      const sampleDoc = sharedDocsSnapshot.docs[0].data();
    }

    const sharedDocs = sharedDocsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      isShared: true,
    }));

    return sharedDocs;
  } catch (error) {
    console.error("Error getting shared documents:", error);
    throw error;
  }
}
