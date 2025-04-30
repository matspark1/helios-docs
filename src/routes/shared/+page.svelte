<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { user } from "../../stores/authStore";
  import Header from "$lib/components/Header.svelte";
  import Profile from "$lib/components/Profile.svelte";
  import DocumentPreview from "$lib/components/documentPreview.svelte";
  import DocumentSearch from "$lib/components/DocumentSearch.svelte";
  import {
    profileModalVisible,
    closeProfileModal,
  } from "$lib/util/profileModal.js";
  import { getUserSharedDocuments } from "$lib/services/documentService";
  import meta from "$lib/images/meta.png";

  let currentUser;
  let allSharedDocuments = [];
  let filteredDocuments = [];
  let searchQuery = "";
  let isLoading = true;

  $: user.subscribe((value) => {
    currentUser = value;
    if (currentUser) {
      loadSharedDocuments();
    }
  });

  $: {
    if (allSharedDocuments && allSharedDocuments.length > 0) {
      if (searchQuery) {
        filteredDocuments = allSharedDocuments.filter((doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        filteredDocuments = [...allSharedDocuments].sort((a, b) => {
          const aTime = a.lastOpenedAt
            ? a.lastOpenedAt.toMillis()
            : a.updatedAt
              ? a.updatedAt.toMillis()
              : 0;
          const bTime = b.lastOpenedAt
            ? b.lastOpenedAt.toMillis()
            : b.updatedAt
              ? b.updatedAt.toMillis()
              : 0;
          return bTime - aTime;
        });
      }
    } else {
      filteredDocuments = [];
    }
  }

  async function loadSharedDocuments() {
    if (!currentUser) return;
    isLoading = true;

    try {
      allSharedDocuments = await getUserSharedDocuments();
    } catch (error) {
      console.error("Error loading shared documents:", error);
    } finally {
      isLoading = false;
    }
  }

  function handleSearch(event) {
    searchQuery = event.detail;
  }

  onMount(() => {
    if (currentUser) {
      loadSharedDocuments();
    }
  });
</script>

<svelte:head>
  <title>Shared Docs | Helios Docs</title>
  <meta
    name="description"
    content="Access documents shared with you on Helios Docs. Collaborate and edit shared files in real-time."
  />
  <meta property="og:type" content="website" />
  <meta
    property="og:description"
    content="Modernize your team's workflow with Helios Docs. View and edit documents shared with you for seamless collaboration."
  />
  <meta property="og:image" content={meta} />
  <meta
    name="keywords"
    content="shared documents, collaborative editing, document sharing, team collaboration, helios docs"
  />
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
          <DocumentSearch
            value={searchQuery}
            placeholder="Search shared documents..."
            on:search={handleSearch}
          />
        </div>

        <div class="docs-boxes-wrapper">
          {#if isLoading}
            <div class="loading-documents">
              <span class="loader"></span>
            </div>
          {:else if filteredDocuments && filteredDocuments.length > 0}
            <div class="docs-boxes">
              {#each filteredDocuments as document}
                <DocumentPreview {document} />
              {/each}
            </div>
          {:else if searchQuery && allSharedDocuments.length > 0}
            <p class="no-documents">
              No shared documents match your search for "{searchQuery}".
            </p>
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
