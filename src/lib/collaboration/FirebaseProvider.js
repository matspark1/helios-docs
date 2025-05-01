import * as Y from "yjs";
import { ref, onValue, set, onDisconnect, get } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { db, rtdb, auth } from "$lib/FirebaseConfig";
import { v4 as uuidv4 } from "uuid";
import pfp from "$lib/images/pfp.png";
import toast from "svelte-5-french-toast";

export class FirebaseProvider {
  constructor(documentId, ydoc) {
    this.documentId = documentId;
    this.ydoc = ydoc;
    this.clientId = auth.currentUser?.uid || uuidv4();
    this.awareness = {
      clientID: this.clientId,
      name: auth.currentUser?.displayName || "Anonymous",
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      profilePic: auth.currentUser?.photoURL || pfp,
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

    // IMPORTANT: Set up updates first so we don't miss anything
    this.setUpUpdates();

    // Then try to get initial state
    const gotInitialState = await this.getInitialState();

    // If we couldn't get the state vector, try to reconstruct from updates
    if (!gotInitialState) {
      await this.reconstructFromUpdates();
    }

    this.setUpAwareness();
    this.setClientStatus(true);

    // CRITICAL: Make sure we hook up the update event AFTER loading initial state
    this.ydoc.on("update", this.handleDocumentUpdate.bind(this));

    this.connected = true;

    if (auth.currentUser) {
      this.updateProfilePic();
    }
  }

  async getInitialState() {
    try {
      const stateVectorRef = ref(
        rtdb,
        `yjs-docs/${this.documentId}/state-vector`
      );
      const snapshot = await get(stateVectorRef);

      if (snapshot.exists()) {
        const stateVector = snapshot.val();
        const update = Y.encodeStateAsUpdate(
          this.ydoc,
          new Uint8Array(Object.values(stateVector))
        );
        Y.applyUpdate(this.ydoc, update);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error getting initial state:", error);
      return false;
    }
  }

  updateStateVector() {
    try {
      if (Math.random() > 0.1) return;

      const stateVector = Y.encodeStateVector(this.ydoc);
      const stateVectorArray = Array.from(stateVector);
      const stateVectorObj = {};

      stateVectorArray.forEach((value, index) => {
        stateVectorObj[index] = value;
      });

      set(
        ref(rtdb, `yjs-docs/${this.documentId}/state-vector`),
        stateVectorObj
      ).catch((error) => {
        console.error("Error updating state vector:", error);
      });
    } catch (error) {
      console.error("Error generating state vector:", error);
    }
  }

  async reconstructFromUpdates() {
    try {
      const snapshot = await get(this.updatesRef);
      if (!snapshot.exists()) return;

      const updates = snapshot.val();
      const sortedUpdates = Object.entries(updates)
        .map(([id, update]) => ({ id, ...update }))
        .sort((a, b) => {
          const aTime = new Date(a.timestamp).getTime();
          const bTime = new Date(b.timestamp).getTime();
          return aTime - bTime;
        });

      for (const update of sortedUpdates) {
        try {
          Y.applyUpdate(
            this.ydoc,
            new Uint8Array(Object.values(update.content))
          );
          const updateTime = new Date(update.timestamp).getTime();
          this.lastProcessedTimestamp = Math.max(
            this.lastProcessedTimestamp,
            updateTime
          );
        } catch (err) {
          console.error("Error applying update during reconstruction:", err);
        }
      }
    } catch (error) {
      console.error("Error reconstructing from updates:", error);
    }
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
   * Update awareness data with user profile picture
   */
  async updateProfilePic() {
    if (auth.currentUser?.photoURL) {
      this.awareness.profilePic = auth.currentUser.photoURL;

      set(
        ref(rtdb, `yjs-docs/${this.documentId}/awareness/${this.clientId}`),
        this.awareness
      );

      this.emit("change", { [this.clientId]: this.awareness });
    }
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
    this.lastProcessedTimestamp = 0;
    let processingUpdates = false;

    const updatesListener = onValue(this.updatesRef, (snapshot) => {
      if (!snapshot.exists() || processingUpdates) return;

      processingUpdates = true;
      try {
        const data = snapshot.val();

        // Get updates sorted by timestamp
        const updates = Object.entries(data)
          .map(([id, update]) => ({ id, ...update }))
          .sort((a, b) => {
            const aTime = new Date(a.timestamp).getTime();
            const bTime = new Date(b.timestamp).getTime();
            return aTime - bTime;
          });

        const newUpdates = updates.filter((update) => {
          const updateTime = new Date(update.timestamp).getTime();
          return (
            updateTime > this.lastProcessedTimestamp &&
            update.clientId !== this.clientId
          );
        });

        if (newUpdates.length > 0) {
          for (const update of newUpdates) {
            try {
              Y.applyUpdate(
                this.ydoc,
                new Uint8Array(Object.values(update.content))
              );

              const updateTime = new Date(update.timestamp).getTime();
              this.lastProcessedTimestamp = Math.max(
                this.lastProcessedTimestamp,
                updateTime
              );
            } catch (err) {
              console.error("Error applying Yjs update:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error processing updates:", err);
      } finally {
        processingUpdates = false;
      }
    });

    this.listeners.push(updatesListener);
  }

  /**
   * Handle document updates from Yjs
   */
  handleDocumentUpdate(update, origin) {
    if (origin === this || !this.connected){
      return
    }

    const now = Date.now();
    if (this.lastUpdateTime && now - this.lastUpdateTime < 50) {
      if (!this.pendingUpdate) {
        this.updateTimeoutId = setTimeout(() => {
          if (this.pendingUpdate) {
            this._sendUpdate(this.pendingUpdate);
            this.pendingUpdate = null;
            this.updateStateVector();
          }
        }, 50);
      }

      this.pendingUpdate = update;
      return;
    }

    this.lastUpdateTime = now;
    this._sendUpdate(update);
    this.updateStateVector();
  }

  /**
   * Helper method to send updates to Firebase
   */
  _sendUpdate(update) {

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
    })
      .then(() => {
        console.log("Update sent successfully");
      })
      .catch((error) => {
        console.error("Error sending update to Firebase:", error);
      });
  }

  /**
   * Clean up old updates
   */
  async cleanupOldUpdates() {
    try {
      const snapshot = await get(this.updatesRef);
      if (!snapshot.exists()) return;

      const updates = snapshot.val();
      const updateIds = Object.keys(updates);

      if (updateIds.length <= 100) return;

      const sortedIds = updateIds.sort((a, b) => {
        const aTime = new Date(updates[a].timestamp).getTime();
        const bTime = new Date(updates[b].timestamp).getTime();
        return aTime - bTime;
      });

      const idsToKeep = sortedIds.slice(-100);
      const updatesToKeep = {};

      idsToKeep.forEach((id) => {
        updatesToKeep[id] = updates[id];
      });

      await set(this.updatesRef, updatesToKeep);
    } catch (error) {
      console.error("Error cleaning up old updates:", error);
    }
  }

  /**
   * awareness for CollaborationCursor
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

  async cleanupStaleAwareness() {
    try {
      const clientsSnapshot = await get(this.clientsRef);
      const clientsData = clientsSnapshot.exists() ? clientsSnapshot.val() : {};

      const awarenessSnapshot = await get(this.awarenessRef);
      const awarenessData = awarenessSnapshot.exists()
        ? awarenessSnapshot.val()
        : {};

      const currentTime = new Date().getTime();
      const staleCutoff = currentTime - 3 * 60 * 1000;
      const activeClientIds = new Set();

      for (const [clientId, clientData] of Object.entries(clientsData)) {
        if (clientData.isOnline === true && clientData.lastSeen) {
          try {
            const lastSeenTime = new Date(clientData.lastSeen).getTime();
            if (lastSeenTime > staleCutoff) {
              activeClientIds.add(clientId);
            }
          } catch (e) {
            console.error("Error parsing lastSeen:", e);
          }
        }
      }

      for (const userId of Object.keys(awarenessData)) {
        if (!activeClientIds.has(userId)) {
          await set(
            ref(rtdb, `yjs-docs/${this.documentId}/awareness/${userId}`),
            null
          );
        }
      }
    } catch (error) {
      console.error("Error cleaning up stale awareness data:", error);
    }
  }
}
