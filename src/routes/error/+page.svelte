<script>
  import { user } from "../../stores/authStore";
  import Header from "$lib/components/Header.svelte";
  import Profile from "$lib/components/Profile.svelte";
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
  <title>Error | Helios Docs</title>
  <meta name="description" content="Error | Helios Docs" />
</svelte:head>

<div class="app-container">
  <Header />
  <div class="bg-wrapper">
    <div class="content-wrapper">
      {#if $profileModalVisible}
        <Profile on:close={closeProfileModal} />
      {/if}
      <div class="error-wrapper">
        <h1>403</h1>
        <h3>Access Forbidden</h3>
        <p>You do not have permission to view this document.</p>
        <a href="/docs" class="error-back">Go Back</a>
      </div>
    </div>
  </div>
</div>
