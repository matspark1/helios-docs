<script>
  import { onMount, onDestroy } from "svelte";
  import { auth, rtdb } from "$lib/FirebaseConfig";
  import { ref, onValue } from "firebase/database";

  export let documentId;
  export let provider;

  let activeUsers = [];
  let unsubscribeClients;
  let clientId =
    auth.currentUser?.uid || (provider ? provider.clientId : null) || "unknown";
  let checkInProgress = false;

  function processClientData(clientsData) {
    if (checkInProgress || !clientsData) return;

    checkInProgress = true;

    try {
      const currentTime = new Date().getTime();
      const newActiveUsers = [];

      Object.entries(clientsData).forEach(([userId, userData]) => {
        if (userId === clientId || !userData || !userData.isOnline) return;

        if (userData.lastSeen) {
          try {
            const lastSeen = new Date(userData.lastSeen).getTime();
            if (currentTime - lastSeen < 2 * 60 * 1000) {
              const awareness = userData.awareness || {};

              newActiveUsers.push({
                id: userId,
                name: awareness.name || "Anonymous",
                color: awareness.color || "#cccccc",
                profilePic: awareness.profilePic || "/default-avatar.png",
              });
            }
          } catch (e) {
            // skip user
          }
        }
      });

      if (JSON.stringify(newActiveUsers) !== JSON.stringify(activeUsers)) {
        activeUsers = newActiveUsers;
      }
    } catch (e) {
    } finally {
      checkInProgress = false;
    }
  }

  onMount(() => {
    if (provider && provider.clientId) {
      clientId = provider.clientId;
    } else if (auth.currentUser?.uid) {
      clientId = auth.currentUser.uid;
    }

    const clientsRef = ref(rtdb, `yjs-docs/${documentId}/clients`);

    let timeoutId = null;
    unsubscribeClients = onValue(clientsRef, (snapshot) => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        if (snapshot.exists()) {
          processClientData(snapshot.val());
        }
      }, 1000);
    });
  });

  onDestroy(() => {
    if (typeof unsubscribeClients === "function") {
      unsubscribeClients();
    }
  });
</script>

<div class="active-users-container">
  {#if activeUsers.length > 0}
    <div class="active-users">
      {#each activeUsers as user (user.id)}
        <div
          class="user-avatar"
          title={user.name}
          style="border-color: {user.color}"
        >
          <img src={user.profilePic} alt={user.name} />
        </div>
      {/each}
    </div>
  {:else}
    <div class="no-users"></div>
  {/if}
</div>
