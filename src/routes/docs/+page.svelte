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
  import {
    createDocument,
    getUserDocuments,
  } from "$lib/services/documentService";

  let currentUser;
  let allUserDocuments = [];
  let filteredDocuments = [];
  let searchQuery = "";
  let isCreatingDocument = false;
  let isLoading = true;
  let hasSharedDocuments = false;

  $: user.subscribe((value) => {
    currentUser = value;
    if (currentUser) {
      loadUserDocuments();
    }
  });

  $: {
    if (allUserDocuments && allUserDocuments.length > 0) {
      if (searchQuery) {
        filteredDocuments = allUserDocuments.filter((doc) =>
          doc.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      } else {
        filteredDocuments = [...allUserDocuments].sort((a, b) => {
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

  async function handleCreateDocument() {
    if (!currentUser) {
      alert("You must be logged in to create a document");
      return;
    }

    if (isCreatingDocument) return;

    try {
      isCreatingDocument = true;
      const documentId = await createDocument("Untitled Document");
      goto(`/docs/${documentId}`);
    } catch (error) {
      console.error("Error creating document:", error);
      alert("Failed to create document. Please try again.");
    } finally {
      isCreatingDocument = false;
    }
  }

  async function loadUserDocuments() {
    if (!currentUser) return;
    isLoading = true;

    try {
      const allDocs = await getUserDocuments();

      allUserDocuments = allDocs.filter(
        (doc) => doc.ownerId === currentUser.uid
      );

      hasSharedDocuments = allDocs.some(
        (doc) => doc.ownerId !== currentUser.uid
      );
    } catch (error) {
      console.error("Error loading user documents:", error);
    } finally {
      isLoading = false;
    }
  }

  function handleSearch(event) {
    searchQuery = event.detail;
  }

  onMount(() => {
    if (currentUser) {
      loadUserDocuments();
    }
  });
</script>

<svelte:head>
  <title>Docs | Helios Docs</title>
  <meta name="description" content="Docs | Helios Docs" />
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
          <button
            class="new-docs-btn"
            aria-label="new-document"
            on:click={handleCreateDocument}
            disabled={isCreatingDocument}
          >
            <i class="fa-solid fa-file-circle-plus"></i>
            {#if isCreatingDocument}
              <span class="loading-dot"></span>
            {/if}
          </button>
          <h2>Your <span>Documents</span></h2>
          <DocumentSearch
            value={searchQuery}
            placeholder="Search your documents..."
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
          {:else if searchQuery && allUserDocuments.length > 0}
            <p class="no-documents">
              No documents match your search for "{searchQuery}".
            </p>
          {:else}
            <p class="no-documents">
              You don't have any documents yet. Click the + button to create
              one.
            </p>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .loading-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: var(--primary);
    border-radius: 50%;
    margin-left: 8px;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
    100% {
      opacity: 1;
    }
  }

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
