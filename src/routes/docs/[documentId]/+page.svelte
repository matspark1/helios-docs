<script>
  import { onMount } from "svelte";
  export let data;
  import DocsEditor from "$lib/components/DocsEditor.svelte";
  import { user } from "../../../stores/authStore";
  import Header from "$lib/components/Header.svelte";
  import Profile from "$lib/components/Profile.svelte";
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

    // const container = document.querySelector(".swapy-container");
    // const swapy = createSwapy(container, {
    //   animation: "dynamic",
    //   dragAxis: "x",
    // });
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
        <div class="swapy-container">
          <div data-swapy-slot="a" class="swapy-item-slot" data-swapy-no-drag>
            <div data-swapy-item="a" class="swapy-item-slot" data-swapy-no-drag>
              <div class="editor-container" data-swapy-no-drag>
                <DocsEditor data-swapy-no-drag />
              </div>
            </div>
          </div>
          <div data-swapy-slot="b" class="swapy-item-slot">
            <div data-swapy-item="b" class="swapy-item-slot">
              <div data-swapy-handle class="swapy-drag">
                <svg
                  width="800px"
                  height="800px"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 15H6.01M6 9H6.01M12 9H12.01M18 9H18.01M18 15H18.01M12 15H12.01M7 9C7 9.55228 6.55228 10 6 10C5.44772 10 5 9.55228 5 9C5 8.44772 5.44772 8 6 8C6.55228 8 7 8.44772 7 9ZM7 15C7 15.5523 6.55228 16 6 16C5.44772 16 5 15.5523 5 15C5 14.4477 5.44772 14 6 14C6.55228 14 7 14.4477 7 15ZM13 9C13 9.55228 12.5523 10 12 10C11.4477 10 11 9.55228 11 9C11 8.44772 11.4477 8 12 8C12.5523 8 13 8.44772 13 9ZM13 15C13 15.5523 12.5523 16 12 16C11.4477 16 11 15.5523 11 15C11 14.4477 11.4477 14 12 14C12.5523 14 13 14.4477 13 15ZM19 9C19 9.55228 18.5523 10 18 10C17.4477 10 17 9.55228 17 9C17 8.44772 17.4477 8 18 8C18.5523 8 19 8.44772 19 9ZM19 15C19 15.5523 18.5523 16 18 16C17.4477 16 17 15.5523 17 15C17 14.4477 17.4477 14 18 14C18.5523 14 19 14.4477 19 15Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <div class="chat-container">
                <p>CHAT</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
