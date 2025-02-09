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

<div class="app-container">
  <Header />
  <div class="bg-wrapper">
    <div class="content-wrapper">
      {#if $profileModalVisible}
        <Profile on:close={closeProfileModal} />
      {/if}
      {#if currentUser}
        <h1>Welcome, {currentUser.displayName}!</h1>
      {:else}
        <h1>Loading...</h1>
      {/if}
      <p>HELLO WORLD</p>
    </div>
  </div>
</div>
