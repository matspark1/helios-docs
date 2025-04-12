<script>
  import { onMount } from "svelte";
  export let data;
  import DocsEditor from "$lib/components/DocsEditor.svelte";
  import { user } from "../../../stores/authStore";
  import Header from "$lib/components/Header.svelte";
  import Profile from "$lib/components/Profile.svelte";
  import FileButton from "$lib/components/FileButton.svelte";
  import {
    profileModalVisible,
    closeProfileModal,
  } from "$lib/util/profileModal.js";
  import { createSwapy } from "swapy";

  let currentUser;

  $: user.subscribe((value) => {
    currentUser = value;
  });

  onMount(() => {
    console.log(data);
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
      <div class="doc-editor-wrapper">
        <div class="editor-container">
          <FileButton />
          <DocsEditor />
        </div>
        <div class="chat-container">
          <p>CHAT</p>
        </div>
      </div>
    </div>
  </div>
</div>
