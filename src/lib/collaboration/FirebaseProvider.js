import * as Y from "yjs";
import { ref, onValue, set, onDisconnect, get } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { db, rtdb, auth } from "$lib/FirebaseConfig";
import { v4 as uuidv4 } from "uuid";

export class FirebaseProvider {
  constructor(documentId, ydoc) {
    console.log("Initializing collaboration with document:", documentId);
    this.documentId = documentId;
    this.ydoc = ydoc;
    this.clientId = auth.currentUser?.uid || uuidv4();
    this.awareness = {
      clientID: this.clientId,
      name: auth.currentUser?.displayName || "Anonymous",
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    };
    this._events = {};
    this.connected = false;
    this.listeners = [];
    this.documentRef = ref(rtdb, `yjs-docs/${documentId}`);
    this.updatesRef = ref(rtdb, `yjs-docs/${documentId}/updates`);
    this.awarenessRef = ref(rtdb, `yjs-docs/${documentId}/awareness`);
    this.clientsRef = ref(rtdb, `yjs-docs/${documentId}/clients`);
    this.myClientRef = ref(
      rtdb,
      `yjs-docs/${documentId}/clients/${this.clientId}`
    );
    this.accessRef = ref(rtdb, `document-access/${documentId}`);

    onDisconnect(this.myClientRef).remove();

    this.initialize();
  }

  /**
   * Start the provider
   */
  async initialize() {
    if (auth.currentUser) {
      try {
        await this.syncDocumentAccess();
      } catch (error) {
        console.error("Error checking document access:", error);
      }
    }

    this.setUpAwareness();
    this.setUpUpdates();
    this.setClientStatus(true);

    this.ydoc.on("update", this.handleDocumentUpdate.bind(this));

    this.connected = true;
    console.log("Provider initialized successfully");
  }

  async syncDocumentAccess() {
    try {
      const docRef = doc(db, "documents", this.documentId);
      const docSnapshot = await getDoc(docRef);

      if (!docSnapshot.exists()) {
        console.error("Document not found");
        return false;
      }

      const documentData = docSnapshot.data();

      const userId = auth.currentUser.uid;
      const isOwner = documentData.ownerId === userId;

      if (!isOwner) {
        const sharedWith = documentData.sharedWith || [];
        const hasAccess = sharedWith.some((share) => share.userId === userId);

        if (!hasAccess) {
          console.error("User does not have access to this document");
          return false;
        }
      }

      const accessUpdates = {};

      accessUpdates[documentData.ownerId] = true;

      if (documentData.sharedWith && Array.isArray(documentData.sharedWith)) {
        documentData.sharedWith.forEach((share) => {
          accessUpdates[share.userId] = true;
        });
      }

      await set(this.accessRef, accessUpdates);

      return true;
    } catch (error) {
      console.error("Error syncing document access:", error);
      return false;
    }
  }

  /**
   * Clean up and destroy the provider
   */
  destroy() {
    this.listeners.forEach((listener) => listener());
    this.listeners = [];

    this.ydoc.off("update", this.handleDocumentUpdate);

    this.setClientStatus(false);

    this.connected = false;
  }

  /**
   * Set client online/offline status
   */
  setClientStatus(isOnline) {
    set(this.myClientRef, {
      isOnline,
      lastSeen: new Date().toISOString(),
      awareness: this.awareness,
    });
  }

  /**
   * Set up awareness (cursor position, selection) updates
   */
  setUpAwareness() {
    const awarenessListener = onValue(this.awarenessRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.val();
      this.emit("change", data);
    });

    this.listeners.push(awarenessListener);

    set(
      ref(rtdb, `yjs-docs/${this.documentId}/awareness/${this.clientId}`),
      this.awareness
    );
  }

  /**
   * Update awareness data (cursor position)
   */
  updateAwareness(awarenessData) {
    this.awareness = {
      ...this.awareness,
      ...awarenessData,
    };

    set(
      ref(rtdb, `yjs-docs/${this.documentId}/awareness/${this.clientId}`),
      this.awareness
    );

    this.emit("change", { [this.clientId]: this.awareness });
  }

  /**
   * Set up document updates
   */
  setUpUpdates() {
    const updatesListener = onValue(this.updatesRef, (snapshot) => {
      if (!snapshot.exists()) return;

      const data = snapshot.val();

      Object.entries(data).forEach(([updateId, update]) => {
        if (update.clientId !== this.clientId) {
          try {
            Y.applyUpdate(
              this.ydoc,
              new Uint8Array(Object.values(update.content))
            );
          } catch (err) {
            console.error("Error applying Yjs update:", err);
          }
        }
      });
    });

    this.listeners.push(updatesListener);
  }

  /**
   * Handle document updates from Yjs
   */
  handleDocumentUpdate(update, origin) {
    if (origin === this || !this.connected) return;

    const updateId = new Date().getTime() + "-" + this.clientId;
    const updateRef = ref(
      rtdb,
      `yjs-docs/${this.documentId}/updates/${updateId}`
    );

    const updateArray = Array.from(update);
    const updateObj = {};
    updateArray.forEach((value, index) => {
      updateObj[index] = value;
    });

    set(updateRef, {
      clientId: this.clientId,
      timestamp: new Date().toISOString(),
      content: updateObj,
    });
  }

  /**
   * Clean up old updates
   */
  async cleanupOldUpdates() {
    try {
      const updates = (await get(this.updatesRef)).val() || {};
      const updateIds = Object.keys(updates).sort();

      if (updateIds.length > 100) {
        const updatesToRemove = updateIds.slice(0, updateIds.length - 100);

        for (const updateId of updatesToRemove) {
          await set(
            ref(rtdb, `yjs-docs/${this.documentId}/updates/${updateId}`),
            null
          );
        }
      }
    } catch (error) {
      console.error("Error cleaning up old updates:", error);
    }
  }

  /**
   * awareness interface for CollaborationCursor
   */

  setLocalStateField(field, state) {
    this.awareness[field] = state;

    this.updateAwareness({ [field]: state });
  }

  getLocalState() {
    return this.awareness;
  }

  getStates() {
    return [this.awareness];
  }

  on(event, callback) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(callback);
    return this;
  }

  off(event, callback) {
    if (!this._events[event]) return this;
    if (callback) {
      this._events[event] = this._events[event].filter((cb) => cb !== callback);
    } else {
      delete this._events[event];
    }
    return this;
  }

  emit(event, ...args) {
    if (!this._events[event]) return this;
    this._events[event].forEach((callback) => callback(...args));
    return this;
  }
}
