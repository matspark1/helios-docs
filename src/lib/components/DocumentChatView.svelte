<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte";
  import { auth } from "$lib/FirebaseConfig";
  import { subscribeToChat, sendChatMessage } from "$lib/services/chatService";
  import { getDocument } from "$lib/services/documentService";
  import { goto } from "$app/navigation";

  const dispatch = createEventDispatcher();

  export let documentId = null;
  export let isMobileView = false;

  let selectedDocument = null;
  let messages = [];
  let newMessage = "";
  let unsubscribe;
  let chatContainer;
  let isLoading = true;

  $: if (documentId) {
    fetchDocumentDetails();
    setupChatSubscription();
  } else {
    messages = [];
    selectedDocument = null;
    isLoading = false;
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  function handleMessagesUpdate(newMessages) {
    messages = newMessages;
    isLoading = false;
    setTimeout(() => {
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  async function handleSendMessage() {
    if (!newMessage.trim() || !documentId) return;

    try {
      await sendChatMessage(documentId, newMessage.trim());
      newMessage = "";
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  async function fetchDocumentDetails() {
    if (!documentId) return;

    try {
      isLoading = true;
      const document = await getDocument(documentId);
      if (document) {
        selectedDocument = document;
      }
    } catch (error) {
      console.error("Error fetching document details:", error);
    }
  }

  function setupChatSubscription() {
    if (unsubscribe) {
      unsubscribe();
    }

    if (documentId) {
      messages = [];
      isLoading = true;
      unsubscribe = subscribeToChat(documentId, handleMessagesUpdate);
    }
  }

  function navigateToEditor() {
    if (documentId) {
      goto(`/docs/${documentId}`);
    }
  }

  function handleBackClick() {
    dispatch("backToChats");
  }

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
</script>

{#if !documentId}
  <div class="empty-selection">
    <p>Select a chat from the sidebar to start messaging</p>
  </div>
{:else}
  <div class="chat-wrapper2">
    <div class="chat-header2">
      {#if isMobileView}
        <button
          class="back-button"
          on:click={handleBackClick}
          aria-label="Back to chats"
        >
          <i class="fa-solid fa-arrow-left"></i>
        </button>
      {/if}
      <h3>{selectedDocument ? selectedDocument.title : "Loading..."}</h3>
      <div class="tooltip-container6">
        <button
          class="chatFileBtn"
          on:click={navigateToEditor}
          aria-label="Open Document"
        >
          <i class="fi fi-rr-document"></i>
        </button>
        <div class="tooltip6">Open Document</div>
      </div>
    </div>

    <div class="chat-messages2" bind:this={chatContainer}>
      {#if isLoading}
        <div class="loading-chat">
          <span class="loader"></span>
        </div>
      {:else if messages.length === 0}
        <div class="empty-chat">
          <p>No messages yet. Start the conversation!</p>
        </div>
      {:else}
        {#each messages as message (message.id)}
          <div
            class="chat-message2"
            class:own-message={message.senderId === auth.currentUser?.uid}
          >
            <div class="message-avatar">
              <img
                src={message.profilePic || "/default-avatar.png"}
                alt={message.senderName}
              />
            </div>
            <div class="message-content">
              <div class="message-header2">
                <span class="sender-name"
                  >{message.senderName || "Anonymous"}</span
                >
                <span class="message-time">
                  {#if message.timestamp && message.timestamp.toMillis}
                    {new Date(message.timestamp.toMillis()).toLocaleTimeString(
                      [],
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  {:else}
                    Just now
                  {/if}
                </span>
              </div>
              <div class="message-text">{message.message}</div>
            </div>
          </div>
        {/each}
      {/if}
    </div>

    <div class="chat-input2">
      <form on:submit|preventDefault={handleSendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          bind:value={newMessage}
          disabled={!documentId}
        />
        <button type="submit" disabled={!newMessage.trim() || !documentId}>
          <i class="fa-solid fa-arrow-up"></i>
        </button>
      </form>
    </div>
  </div>
{/if}
