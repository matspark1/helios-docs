import { get, ref, onValue } from "firebase/database";
import { rtdb } from "$lib/FirebaseConfig";

// rate-limit repeated function calls
function createRateLimitedFunction(fn, interval = 2000) {
  let lastCall = 0;
  let cachedResult = null;

  return async function (...args) {
    const now = Date.now();
    if (now - lastCall < interval && cachedResult !== null) {
      return cachedResult;
    }

    lastCall = now;
    cachedResult = await fn.apply(this, args);
    return cachedResult;
  };
}

export function extendFirebaseProvider(provider) {
  if (!provider) {
    console.error("No provider provided to extend");
    return null;
  }

  // store documentId from the provider
  const documentId = provider.documentId;
  if (!documentId) {
    console.error("Provider has no documentId, functionality will be limited");
    return null;
  }

  const wrapper = Object.create(provider);

  wrapper._documentId = documentId;
  wrapper._clientId = provider.clientId;

  const getAwarenessDataImpl = async function () {
    try {
      if (this.awarenessRef) {
        const snapshot = await get(this.awarenessRef);
        if (snapshot.exists()) {
          return snapshot.val();
        }
      }

      const docId = this._documentId || this.documentId;
      if (!docId) {
        return {};
      }

      const awarenessRef = ref(rtdb, `yjs-docs/${docId}/awareness`);
      const snapshot = await get(awarenessRef);
      if (!snapshot.exists()) {
        return {};
      }

      return snapshot.val();
    } catch (error) {
      console.error("Error getting awareness data:", error);
      return {};
    }
  };

  const getActiveClientsImpl = async function () {
    try {
      let clientsData = {};

      if (this.clientsRef) {
        const snapshot = await get(this.clientsRef);
        if (snapshot.exists()) {
          clientsData = snapshot.val();
        }
      }

      if (Object.keys(clientsData).length === 0) {
        const docId = this._documentId || this.documentId;
        if (!docId) {
          return {};
        }

        const clientsRef = ref(rtdb, `yjs-docs/${docId}/clients`);
        const snapshot = await get(clientsRef);
        if (snapshot.exists()) {
          clientsData = snapshot.val();
        }
      }

      return clientsData;
    } catch (error) {
      console.error("Error getting active clients:", error);
      return {};
    }
  };

  wrapper.getAwarenessData = createRateLimitedFunction(
    getAwarenessDataImpl.bind(wrapper),
    2000
  );
  wrapper.getActiveClients = createRateLimitedFunction(
    getActiveClientsImpl.bind(wrapper),
    2000
  );

  wrapper.subscribeToAwareness = function (callback) {
    const docId = this._documentId || this.documentId;

    if (!docId) {
      return () => {};
    }

    const awarenessRef = ref(rtdb, `yjs-docs/${docId}/awareness`);
    const unsubscribe = onValue(awarenessRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback({});
        return;
      }

      callback(snapshot.val());
    });

    return unsubscribe;
  };

  wrapper.subscribeToClients = function (callback) {
    const docId = this._documentId || this.documentId;

    if (!docId) {
      return () => {};
    }

    const clientsRef = ref(rtdb, `yjs-docs/${docId}/clients`);
    const unsubscribe = onValue(clientsRef, (snapshot) => {
      if (!snapshot.exists()) {
        callback({});
        return;
      }

      callback(snapshot.val());
    });

    return unsubscribe;
  };

  return wrapper;
}
