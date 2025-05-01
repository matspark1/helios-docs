<script>
  import { onMount } from "svelte";
  import { user } from "../../stores/authStore.js";
  import Header from "$lib/components/Header.svelte";
  import Profile from "$lib/components/Profile.svelte";
  import DocumentChatsSidebar from "$lib/components/DocumentChatsSidebar.svelte";
  import DocumentChatView from "$lib/components/DocumentChatView.svelte";
  import {
    profileModalVisible,
    closeProfileModal,
  } from "$lib/util/profileModal.js";
  import meta from "$lib/images/meta.png";

  let currentUser;
  let selectedDocumentId = null;
  let isLoading = true;
  let isMobileView = false;
  let showMobileChat = false;

  $: user.subscribe((value) => {
    currentUser = value;
    if (currentUser) {
      isLoading = false;
    }
  });

  function handleChatSelect(event) {
    selectedDocumentId = event.detail.documentId;
    if (isMobileView) {
      setTimeout(() => {
        showMobileChat = true;
      }, 100);
    }
  }

  function handleBackToChats() {
    showMobileChat = false;
  }

  function checkScreenWidth() {
    isMobileView = window.innerWidth < 900;
  }

  onMount(() => {
    let mobileMenu = document.querySelector(".hamburger-menu");
    if (currentUser) {
      isLoading = false;
    }

    checkScreenWidth();
    window.addEventListener("resize", checkScreenWidth);

    function updateMobileMenuClass() {
      if (isMobileView && showMobileChat) {
        mobileMenu?.classList.add("chat-white");
      } else {
        mobileMenu?.classList.remove("chat-white");
      }
    }

    updateMobileMenuClass();

    const unsubscribe = (() => {
      let prevIsMobileView = isMobileView;
      let prevShowMobileChat = showMobileChat;

      return setInterval(() => {
        if (
          prevIsMobileView !== isMobileView ||
          prevShowMobileChat !== showMobileChat
        ) {
          updateMobileMenuClass();
          prevIsMobileView = isMobileView;
          prevShowMobileChat = showMobileChat;
        }
      }, 100);
    })();

    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  });
</script>

<svelte:head>
  <title>Chats | Helios Docs</title>
  <meta
    name="description"
    content="Access document-related chats and discussions in Helios Docs. Communicate with team members about your shared documents."
  />
  <meta
    name="keywords"
    content="document chat, team discussions, document collaboration, messaging, helios docs"
  />

  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://heliosdocs.com/chats" />
  <meta property="og:title" content="Chats | Helios Docs" />
  <meta
    property="og:description"
    content="Discuss documents and collaborate through chatting with your team members."
  />
  <meta property="og:image" content={meta} />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:site_name" content="Helios Docs" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:url" content="https://heliosdocs.com/chats" />
  <meta name="twitter:title" content="Chats | Helios Docs" />
  <meta
    name="twitter:description"
    content="Discuss documents and collaborate through chatting with your team members."
  />
  <meta name="twitter:image" content={meta} />
</svelte:head>

<div class="app-container">
  <Header />
  <div class="bg-wrapper">
    <div class="content-wrapper3">
      {#if $profileModalVisible}
        <Profile on:close={closeProfileModal} />
      {/if}

      {#if isLoading}
        <div class="loading-container">
          <span class="loader"></span>
        </div>
      {:else}
        <div class="chat-page-wrapper">
          <div
            class="sidebar-container"
            class:hidden-mobile={isMobileView && showMobileChat}
          >
            <DocumentChatsSidebar
              {selectedDocumentId}
              on:selectChat={handleChatSelect}
            />
          </div>
          <div
            class="chat-view-container"
            class:mobile-chat-view={isMobileView}
            class:show-mobile-chat={isMobileView && showMobileChat}
          >
            <DocumentChatView
              documentId={selectedDocumentId}
              {isMobileView}
              on:backToChats={handleBackToChats}
            />
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

  .sidebar-container {
    width: 280px;
    height: 100%;
  }

  .chat-view-container {
    flex: 1;
    height: 100%;
  }

  @media (max-width: 900px) {
    .chat-view-container {
      display: block;
      position: fixed;
      top: 64px;
      left: 100%;
      width: 100%;
      height: calc(100vh - 64px);
      transition: transform 0.3s ease-in-out;
      z-index: 100;
    }

    .show-mobile-chat {
      transform: translateX(-100%);
    }

    .hidden-mobile {
      display: none;
    }
  }
</style>
