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
  import {
    createDocument,
    getUserDocuments,
  } from "$lib/services/documentService";
  import meta from "$lib/images/meta.png";

  let currentUser;
  let recentDocuments = [];
  let isCreatingDocument = false;
  let isLoading = true;
  let greeting = "";
  let isMobileView = false;

  $: user.subscribe((value) => {
    currentUser = value;
    if (currentUser) {
      setGreeting(currentUser.displayName || "User");
      loadRecentDocuments();
    }
  });

  function setGreeting(name) {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      greeting = `Good morning, ${name}`;
    } else if (hour >= 12 && hour < 18) {
      greeting = `Good afternoon, ${name}`;
    } else {
      greeting = `Good evening, ${name}`;
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
      setTimeout(() => goto(`/docs/${documentId}`), 200);
    } catch (error) {
    } finally {
      isCreatingDocument = false;
    }
  }

  async function loadRecentDocuments() {
    if (!currentUser) return;
    isLoading = true;

    try {
      const allDocs = await getUserDocuments();
      const sortedDocs = [...allDocs].sort((a, b) => {
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
      recentDocuments = sortedDocs.slice(0, 4);
    } catch (error) {
    } finally {
      isLoading = false;
    }
  }

  function checkScreenWidth() {
    isMobileView = window.innerWidth < 900;
  }

  onMount(() => {
    if (currentUser) {
      setGreeting(currentUser.displayName || "User");
      loadRecentDocuments();
    }
    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);
    return () => window.removeEventListener("resize", checkScreenWidth);
  });
</script>

<svelte:head>
  <title>Home | Helios Docs</title>
  <meta
    name="description"
    content="Your Helios Docs dashboard. Access recent documents, create new files, and manage your document workspace."
  />
  <meta
    name="keywords"
    content="document dashboard, document management, create documents, helios docs workspace, document collaboration"
  />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://heliosdocs.com/home" />
  <meta property="og:title" content="Home | Helios Docs" />
  <meta
    property="og:description"
    content="Access your dashboard to manage documents and collaboration."
  />
  <meta property="og:image" content={meta} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Helios Docs" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="https://heliosdocs.com/home" />
  <meta name="twitter:title" content="Home | Helios Docs" />
  <meta
    name="twitter:description"
    content="Access your dashboard to manage documents and collaboration."
  />
  <meta name="twitter:image" content={meta} />
</svelte:head>

<div class="app-container">
  <Header />
  <div class="bg-wrapper">
    <div class="content-wrapper4">
      {#if $profileModalVisible}
        <Profile on:close={closeProfileModal} />
      {/if}
      <div class="home-wrapper">
        <div class="home-content-wrapper">
          <div class="welcome-section">
            <div class="welcome-text">
              <h1 class="welcome-heading">{greeting}</h1>
              <p style="margin-top: 10px;">
                Ready to start creating documents? Let’s get to work.
              </p>
            </div>
          </div>

          <div class="home-content">
            <div class="home-box recent-docs">
              <div class="box-header">
                <h2>Recent <span>Documents</span></h2>
              </div>

              {#if isLoading}
                <div class="loading-container">
                  <span class="loader"></span>
                </div>
              {:else if recentDocuments.length > 0}
                <div class="recent-docs-grid">
                  {#each recentDocuments as document}
                    <DocumentPreview {document} />
                  {/each}
                </div>
              {:else}
                <div class="empty-state">
                  <i class="fa-regular fa-file-lines empty-icon"></i>
                  <p>You don't have any documents yet</p>
                </div>
              {/if}
            </div>
            <div class="home-box quick-actions-box">
              <h2>Quick <span>Actions</span></h2>
              <div class="actions-grid">
                <button
                  class="action-button primary"
                  on:click={handleCreateDocument}
                  class:hidden-mobile={isMobileView}
                >
                  <i class="fa-solid fa-plus"></i>
                  <span>New Document</span>
                </button>
                <a href="/docs" class="action-button secondary">
                  <i class="fa-solid fa-folder-open"></i>
                  <span>All Documents</span>
                </a>
                <button
                  class="action-button secondary"
                  on:click={goto(`/chats`)}
                >
                  <i class="fa-solid fa-comment"></i>
                  <span>All Chats</span>
                </button>
                <a href="/shared" class="action-button secondary">
                  <i class="fa-solid fa-share-nodes"></i>
                  <span>View Shared Documents</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
