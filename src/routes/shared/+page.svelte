<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { user } from "../../stores/authStore";
  import Header from "$lib/components/Header.svelte";
  import Profile from "$lib/components/Profile.svelte";
  import DocumentPreview from "$lib/components/documentPreview.svelte";
  import {
    profileModalVisible,
    closeProfileModal,
  } from "$lib/util/profileModal.js";
  import { getUserSharedDocuments } from "$lib/services/documentService";

  let currentUser;
  let sharedDocuments = [];
  let isLoading = true;

  $: user.subscribe((value) => {
    currentUser = value;
    if (currentUser) {
      loadSharedDocuments();
    }
  });

  async function loadSharedDocuments() {
    if (!currentUser) return;
    isLoading = true;

    try {
      sharedDocuments = await getUserSharedDocuments();
      console.log("Shared documents:", sharedDocuments);
    } catch (error) {
      console.error("Error loading shared documents:", error);
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    if (currentUser) {
      loadSharedDocuments();
    }
  });
</script>

<svelte:head>
  <title>Shared Docs | Helios Docs</title>
  <meta name="description" content="Shared Docs | Helios Docs" />
</svelte:head>

<div class="app-container">
  <Header />
  <div class="bg-wrapper">
    <div class="content-wrapper">
      {#if $profileModalVisible}
        <Profile on:close={closeProfileModal} />
      {/if}
      <div class="docs-wrapper">
        <div class="docs-header">
          <h2>Shared <span>Documents</span></h2>
          <div class="docs-search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" class="docs-search-input" />
          </div>
        </div>

        <div class="docs-boxes-wrapper">
          {#if isLoading}
            <div class="loading-documents">
              <span class="loader"></span>
            </div>
          {:else if sharedDocuments && sharedDocuments.length > 0}
            <div class="docs-boxes">
              {#each sharedDocuments as document}
                <DocumentPreview {document} />
              {/each}
            </div>
          {:else}
            <p class="no-documents">
              No documents have been shared with you yet.
            </p>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .loading-documents {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px;
    font-size: 18px;
  }

  .no-documents {
    text-align: center;
    color: var(--black);
    font-size: 16px;
    margin-top: 40px;
  }
</style>
