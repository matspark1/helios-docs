<script>
  import { onMount } from "svelte";
  export let data;
  import DocsEditor from "$lib/components/DocsEditor.svelte";
  import DocumentChat from "$lib/components/DocumentChat.svelte";
  import { user } from "../../../stores/authStore";
  import Header from "$lib/components/Header.svelte";
  import Profile from "$lib/components/Profile.svelte";
  import FileButton from "$lib/components/FileButton.svelte";
  import {
    profileModalVisible,
    closeProfileModal,
  } from "$lib/util/profileModal.js";
  import { checkDocumentAccess } from "$lib/services/documentService.js";
  import { goto } from "$app/navigation";

  let currentUser;
  let documentAccess = { hasAccess: false, role: null };
  let isLoading = true;

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
      goto("/error");
    }

    isLoading = false;
  }

  onMount(() => {
    if (currentUser && data.documentId) {
      checkAccess();
    }
  });
</script>

<svelte:head>
  <title>Editor | Helios Docs</title>
  <meta name="description" content="Docs | Helios Docs" />
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
        <div class="doc-editor-wrapper">
          <div class="editor-container">
            <FileButton documentId={data.documentId} />
            <DocsEditor documentId={data.documentId} />
          </div>
          <div class="chat-container">
            <DocumentChat documentId={data.documentId} />
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
</style>
