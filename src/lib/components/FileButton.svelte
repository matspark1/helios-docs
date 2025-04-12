<script>
  import { fade, fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { onMount, onDestroy } from "svelte";

  let isOpen = false;
  let buttonElement;
  let browser = false;

  function toggleDropdown(event) {
    event.stopPropagation();
    isOpen = !isOpen;
  }

  function closeDropdown() {
    isOpen = false;
  }

  onMount(() => {
    browser = true;

    if (browser) {
      window.addEventListener("click", closeDropdown);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener("click", closeDropdown);
    }
  });
</script>

<div class="doc-file-container">
  <button
    class="doc-file-btn"
    class:active={isOpen}
    aria-label="File"
    on:click={toggleDropdown}
    bind:this={buttonElement}
  >
    <i class="fi fi-rr-document"></i>
  </button>

  {#if isOpen}
    <div
      class="file-btn-options"
      on:click|stopPropagation
      transition:fly={{ y: -50, duration: 400, easing: quintOut }}
    >
      <div class="tooltip-container5">
        <button class="file-btn-dwnld" aria-label="file-btn-dwnld">
          <i class="fa-regular fa-circle-down"></i>
        </button>
        <div class="tooltip3">Download</div>
      </div>
      <div class="tooltip-container5">
        <button class="file-btn-rename" aria-label="file-btn-rename">
          <i class="fi fi-rr-print"></i>
          <div class="tooltip4">Print</div>
        </button>
      </div>
      <div class="tooltip-container5">
        <button class="file-btn-rename" aria-label="file-btn-rename">
          <i class="fa-solid fa-share"></i>
        </button>
        <div class="tooltip4">Share</div>
      </div>
      <div class="tooltip-container5">
        <button class="file-btn-rename" aria-label="file-btn-rename">
          <i class="fi fi-br-interrogation"></i>
        </button>
        <div class="tooltip4">Details</div>
      </div>
      <div class="tooltip-container5">
        <button class="file-btn-delete" aria-label="file-btn-delete">
          <i class="fa-solid fa-trash"></i>
        </button>
        <div class="tooltip5">Delete Document</div>
      </div>
    </div>
  {/if}
</div>
