<script>
  import { onMount, onDestroy } from "svelte";
  import { getDocument, deleteDocument } from "$lib/services/documentService";
  import { goto } from "$app/navigation";
  import toast from "svelte-5-french-toast";

  export let documentId;

  let showModal = false;
  let isLoading = false;
  let document = null;
  let countdownTime = 2;
  let countdownInterval;

  async function loadDocumentData() {
    try {
      document = await getDocument(documentId);
    } catch (error) {
      console.error("Error loading document:", error);
    }
  }

  function openDeleteModal() {
    loadDocumentData();
    showModal = true;

    countdownTime = 2;
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
      countdownTime--;
      if (countdownTime <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
  }

  function closeModal() {
    showModal = false;
    clearInterval(countdownInterval);
  }

  async function handleDeleteDocument() {
    if (countdownTime > 0) return;

    isLoading = true;

    try {
      await deleteDocument(documentId);
      toast.success("Document deleted successfully");
      closeModal();

      goto("/docs");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    if (documentId) {
      loadDocumentData();
    }
  });

  onDestroy(() => {
    clearInterval(countdownInterval);
  });
</script>

<button
  class="file-btn-delete fileBtn"
  on:click={openDeleteModal}
  aria-label="Delete Document"
>
  <i class="fa-solid fa-trash"></i>
</button>

{#if showModal}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Delete Document</h2>
        <button class="close-button" on:click={closeModal}>
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="delete-warning">
          <i class="fa-solid fa-exclamation-triangle"></i>
          <p>
            This action cannot be undone. This will permanently delete the
            document <strong>"{document?.title || "Untitled Document"}"</strong>
            and all of its contents.
          </p>
        </div>

        <div class="timer-message">
          {#if countdownTime > 0}
            <p>
              Please wait {countdownTime} seconds before confirming deletion.
            </p>
          {:else}
            <p>You can now confirm the deletion.</p>
          {/if}
        </div>
      </div>

      <div class="modal-footer">
        <button
          class="cancel-button"
          on:click={closeModal}
          disabled={isLoading}
        >
          No, Cancel
        </button>
        <button
          class="delete-button"
          on:click={handleDeleteDocument}
          disabled={isLoading || countdownTime > 0}
        >
          {#if isLoading}
            Deleting...
          {:else}
            Yes, Delete
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .delete-warning {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 24px;
    background-color: var(--light-black);
    padding: 16px;
    border-radius: 8px;
    color: var(--red-font);
  }

  .delete-warning i {
    font-size: 24px;
    color: var(--red-font);
  }

  .timer-message {
    margin: 16px 0;
    padding: 12px;
    background-color: var(--light-black);
    border-radius: 8px;
    text-align: center;
  }

  .timer-message p {
    margin: 0;
    font-weight: 500;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .delete-button {
    background-color: var(--primary);
    color: var(--btn-white-white);
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-weight: 600;
  }

  .delete-button:disabled {
    background-color: var(--light-grey2);
    cursor: not-allowed;
  }
</style>
