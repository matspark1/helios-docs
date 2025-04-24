<script>
  import { onMount } from "svelte";
  export let data;
  import { user } from "../../../stores/authStore";
  import Header from "$lib/components/Header.svelte";
  import Profile from "$lib/components/Profile.svelte";
  import DocumentChatsSidebar from "$lib/components/DocumentChatsSidebar.svelte";
  import DocumentChatView from "$lib/components/DocumentChatView.svelte";
  import {
    profileModalVisible,
    closeProfileModal,
  } from "$lib/util/profileModal.js";
  import { checkDocumentAccess } from "$lib/services/documentService.js";
  import { goto } from "$app/navigation";

  let currentUser;
  let documentAccess = { hasAccess: false, role: null };
  let isLoading = true;
  let selectedDocumentId = data.documentId;

  $: user.subscribe((value) => {
    currentUser = value;
    if (currentUser && data.documentId) {
      checkAccess();
    }
  });

  async function checkAccess() {
    isLoading = true;
    documentAccess = await checkDocumentAccess(data.documentId);

    if (!documentAccess.hasAccess) {
      // redirect if user doesn't have access
      goto("/chats");
    }

    isLoading = false;
  }

  function handleChatSelect(event) {
    const newDocumentId = event.detail.documentId;
    if (newDocumentId !== selectedDocumentId) {
      goto(`/chats/${newDocumentId}`);
    }
  }

  onMount(() => {
    if (currentUser && data.documentId) {
      checkAccess();
    }
  });
</script>

<svelte:head>
  <title>Chat | Helios Docs</title>
  <meta name="description" content="Chat | Helios Docs" />
</svelte:head>

<div class="app-container">
  <Header />
  <div class="bg-wrapper">
    <div class="content-wrapper-v2">
      {#if $profileModalVisible}
        <Profile on:close={closeProfileModal} />
      {/if}

      {#if isLoading}
        <div class="loading-container">
          <span class="loader"></span>
        </div>
      {:else if documentAccess.hasAccess}
        <div class="chat-page-wrapper">
          <div class="sidebar-container">
            <DocumentChatsSidebar
              {selectedDocumentId}
              on:selectChat={handleChatSelect}
            />
          </div>
          <div class="chat-view-container">
            <DocumentChatView documentId={selectedDocumentId} />
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 64px);
    font-size: 18px;
  }

  .chat-page-wrapper {
    display: flex;
    height: calc(100vh - 64px);
  }

  .sidebar-container {
    width: 280px;
    height: 100%;
  }

  .chat-view-container {
    flex: 1;
    height: 100%;
  }
</style>
