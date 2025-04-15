<script>
  import { onMount, onDestroy } from "svelte";
  import { auth } from "$lib/FirebaseConfig";
  import { subscribeToChat, sendChatMessage } from "$lib/services/chatService";
  import ShareDocChat from "$lib/components/ShareDocChat.svelte";

  export let documentId;

  let messages = [];
  let newMessage = "";
  let unsubscribe;
  let chatContainer;
  let isLoading = true;

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
    if (!newMessage.trim()) return;

    try {
      await sendChatMessage(documentId, newMessage.trim());
      newMessage = "";
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  onMount(() => {
    if (documentId) {
      unsubscribe = subscribeToChat(documentId, handleMessagesUpdate);
    } else {
      console.error("No documentId provided to DocumentChat component");
      isLoading = false;
    }
  });

  onDestroy(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
</script>

<div class="chat-wrapper">
  <div class="chat-header">
    <h3>Chat</h3>
    <div class="share-btn-chat">
      <ShareDocChat {documentId} />
    </div>
  </div>

  <div class="chat-messages" bind:this={chatContainer}>
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
          class="chat-message"
          class:own-message={message.senderId === auth.currentUser?.uid}
        >
          <div class="message-avatar">
            <img
              src={message.profilePic || "/default-avatar.png"}
              alt={message.senderName}
            />
          </div>
          <div class="message-content">
            <div class="message-header">
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

  <div class="chat-input">
    <form on:submit|preventDefault={handleSendMessage}>
      <input
        type="text"
        placeholder="Type a message..."
        bind:value={newMessage}
      />
      <button type="submit" disabled={!newMessage.trim()}>
        <i class="fa-solid fa-arrow-up"></i>
      </button>
    </form>
  </div>
</div>
