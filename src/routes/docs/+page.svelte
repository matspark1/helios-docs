<script>
  import { user } from "../../stores/authStore";
  import Header from "$lib/components/Header.svelte";
  import Profile from "$lib/components/Profile.svelte";
  import DocumentPreview from "$lib/components/documentPreview.svelte";
  import {
    profileModalVisible,
    closeProfileModal,
  } from "$lib/util/profileModal.js";
  let currentUser;

  $: user.subscribe((value) => {
    currentUser = value;
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
          <button class="new-docs-btn" aria-label="new-document"
            ><i class="fa-solid fa-file-circle-plus"></i></button
          >
          <h2>Your <span>Documents</span></h2>
          <div class="docs-search">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" class="docs-search-input" />
          </div>
        </div>

        <div class="docs-boxes-wrapper">
          <div class="docs-boxes">
            <DocumentPreview />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
