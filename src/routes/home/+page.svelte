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
  <title>Helios Docs</title>
  <meta name="description" content="Home | Helios Docs" />
</svelte:head>

<div class="app-container">
  <Header />
  <div class="bg-wrapper">
    <div class="content-wrapper">
      {#if $profileModalVisible}
        <Profile on:close={closeProfileModal} />
      {/if}
      <div class="home-wrapper">
        <div class="home-content">
          <div class="home-box">
            <h2>Recent <span>Documents</span></h2>
            <div class="home-docs"></div>
          </div>
          <div class="home-box">
            <h2>Recent <span>Chats</span></h2>
            <div class="home-chats"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
