<script>
  import { fade, fly } from "svelte/transition";
  import { quintOut } from "svelte/easing";
  import { onMount, onDestroy } from "svelte";
  import { getContext } from "svelte";
  import ShareDocument from "$lib/components/ShareDocument.svelte";
  import DownloadDocument from "$lib/components/DownloadDocument.svelte";
  import PrintDocument from "$lib/components/PrintDocument.svelte";
  import DocumentDetails from "$lib/components/DocumentDetails.svelte";
  import DeleteDocument from "$lib/components/DeleteDocument.svelte";

  export let documentId;

  let editor = getContext("editor");

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

    if (!editor) {
      const editorElement = document.querySelector(".element");
      if (editorElement && editorElement.__editor) {
        editor = editorElement.__editor;
      }
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
        <PrintDocument {documentId} {editor} />
        <div class="tooltip4">Print</div>
      </div>
      <div class="tooltip-container5">
        <ShareDocument {documentId} />
        <div class="tooltip4">Share</div>
      </div>
      <div class="tooltip-container5">
        <DocumentDetails {documentId} />
        <div class="tooltip4">Details</div>
      </div>
      <div class="tooltip-container5">
        <DeleteDocument {documentId} />
        <div class="tooltip5">Delete Document</div>
      </div>
    </div>
  {/if}
</div>
