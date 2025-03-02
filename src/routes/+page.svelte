<script>
  import { onMount } from "svelte";
  import { user } from "../stores/authStore";
  import { getAuth, onAuthStateChanged } from "firebase/auth";
  import { goto } from "$app/navigation";
  import { initializeApp } from "firebase/app";
  import { page } from "$app/stores";
  import { firebaseConfig } from "$lib/FirebaseConfig";
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

  onMount(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        user.set({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
        });
        goto("/home");
      } else {
        user.set(null);
        goto("/onboarding");
      }
    });
  });
</script>

<svelte:head>
  <title>Helios Docs</title>
  <meta
    name="description"
    content="Helios Docs: Online Document Editor and Collaboration Tool for Teams."
  />
  <meta property="og:type" content="website" />
</svelte:head>

{#if $page.url.pathname === "/onboarding" || $page.url.pathname === "/signup" || $page.url.pathname === "/signin"}
  <div class="nothing"></div>
{:else}
  <div class="app-container">
    <Header />
    <div class="bg-wrapper">
      <div class="content-wrapper-v2">
        {#if $profileModalVisible}
          <Profile on:close={closeProfileModal} />
        {/if}
      </div>
    </div>
  </div>
{/if}
