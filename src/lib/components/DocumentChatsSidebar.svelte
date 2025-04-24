<script>
  import { onMount, onDestroy } from "svelte";
  import { auth, db } from "$lib/FirebaseConfig";
  import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    limit,
    onSnapshot,
  } from "firebase/firestore";
  import Header from "$lib/components/Header.svelte";
  import { goto } from "$app/navigation";
  import { fetchUserProfilePic } from "$lib/util/getProfilePicture";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let selectedDocumentId = null;

  let chatDocuments = [];
  let isLoading = true;
  let unsubscribe;
  let searchTerm = "";
  let isMobileView = false;

  $: filteredChats = searchTerm.trim()
    ? chatDocuments.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.lastChat.message.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : chatDocuments;

  function subscribeToChats() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to view chats");

      const chatsRef = collection(db, "chats");
      const chatQuery = query(chatsRef, orderBy("timestamp", "desc"));

      unsubscribe = onSnapshot(chatQuery, async (snapshot) => {
        const documentsMap = new Map();

        for (const chatDoc of snapshot.docs) {
          const chatData = chatDoc.data();
          const documentId = chatData.documentId;

          if (documentsMap.has(documentId)) {
            const existingTimestamp =
              documentsMap.get(documentId).lastChat.timestamp?.toMillis() || 0;
            const newTimestamp = chatData.timestamp?.toMillis() || 0;
            if (newTimestamp <= existingTimestamp) continue;
          }

          const docRef = collection(db, "documents");
          const docQuery = query(docRef, where("__name__", "==", documentId));
          const docSnapshot = await getDocs(docQuery);

          if (!docSnapshot.empty) {
            const docData = docSnapshot.docs[0].data();

            const isOwner = docData.ownerId === user.uid;
            const isShared = docData.sharedWith?.some((share) =>
              typeof share === "object"
                ? share.userId === user.uid
                : share === user.uid
            );

            if (isOwner || isShared) {
              let profilePic = "/default-avatar.png";
              try {
                if (chatData.senderId) {
                  profilePic = await fetchUserProfilePic(chatData.senderId);
                }
              } catch (error) {
                console.error("Error fetching profile pic:", error);
              }

              documentsMap.set(documentId, {
                id: documentId,
                title: docData.title || "Untitled Document",
                lastChat: {
                  message: chatData.message,
                  sender: chatData.senderName || "Anonymous",
                  timestamp: chatData.timestamp,
                  profilePic,
                },
                updatedAt: docData.updatedAt,
              });
            }
          }
        }

        chatDocuments = Array.from(documentsMap.values()).sort((a, b) => {
          const aTime = a.lastChat.timestamp?.toMillis() || 0;
          const bTime = b.lastChat.timestamp?.toMillis() || 0;
          return bTime - aTime;
        });

        isLoading = false;

        if (chatDocuments.length > 0 && !selectedDocumentId && !isMobileView) {
          selectChat(chatDocuments[0].id);
        }
      });
    } catch (error) {
      console.error("Error subscribing to chats:", error);
      isLoading = false;
    }
  }

  function selectChat(documentId) {
    selectedDocumentId = documentId;
    dispatch("selectChat", { documentId });
  }

  function formatTimestamp(timestamp) {
    if (!timestamp || !timestamp.toMillis) return "Just now";

    const date = new Date(timestamp.toMillis());
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "long" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  }

  function checkScreenWidth() {
    isMobileView = window.innerWidth < 900;
  }

  onMount(() => {
    subscribeToChats();
    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
    window.removeEventListener("resize", checkScreenWidth);
  });
</script>

<div class="chat-sidebar">
  <div class="sidebar-header">
    <h2>Your <span>Chats</span></h2>
  </div>

  <div class="search-container">
    <input
      type="text"
      placeholder="Find chats"
      bind:value={searchTerm}
      class="search-input"
    />
  </div>

  <div class="recent-chats-section">
    <div class="section-header">
      <i class="fa-solid fa-chevron-down"></i>
      <span>Recent</span>
    </div>

    {#if isLoading}
      <div class="loading-indicator">
        <span class="loader"></span>
      </div>
    {:else if filteredChats.length === 0}
      <div class="empty-chats-indicator">
        <p>No chats found</p>
      </div>
    {:else}
      {#each filteredChats as doc}
        <div
          class="chat-item"
          class:active={selectedDocumentId === doc.id}
          on:click={() => selectChat(doc.id)}
          data-document-id={doc.id}
        >
          <div class="chat-icon">
            <i class="fi fi-rr-document"></i>
          </div>
          <div class="chat-info">
            <div class="chat-title">{doc.title}</div>
            <div class="chat-subtitle">
              <span class="sender-name">{doc.lastChat.sender}:</span>
              {doc.lastChat.message}
            </div>
          </div>
          <div class="chat-time">{formatTimestamp(doc.lastChat.timestamp)}</div>
        </div>
      {/each}
    {/if}
  </div>
</div>
