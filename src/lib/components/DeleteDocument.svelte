<script>
  import { onMount } from "svelte";
  import { getDocument, deleteDocument } from "$lib/services/documentService";
  import { goto } from "$app/navigation";
  import toast from "svelte-5-french-toast";

  export let documentId;

  let showModal = false;
  let isLoading = false;
  let document = null;
  let confirmText = "";

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
    confirmText = "";
  }

  function closeModal() {
    showModal = false;
    confirmText = "";
  }

  async function handleDeleteDocument() {
    if (confirmText !== (document?.title || "Untitled Document")) {
      return;
    }

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

        <div class="confirm-delete">
          <p>
            Please type <strong>{document?.title || "Untitled Document"}</strong
            > to confirm.
          </p>
          <input
            type="text"
            placeholder="Type document title to confirm"
            bind:value={confirmText}
            disabled={isLoading}
          />
        </div>
      </div>

      <div class="modal-footer">
        <button
          class="cancel-button"
          on:click={closeModal}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          class="delete-button"
          on:click={handleDeleteDocument}
          disabled={isLoading ||
            confirmText !== (document?.title || "Untitled Document")}
        >
          {#if isLoading}
            Deleting...
          {:else}
            Delete
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
    color: var(--primary);
  }

  .delete-warning i {
    font-size: 24px;
    color: var(--primary);
  }

  .confirm-delete {
    margin-bottom: 16px;
  }

  .confirm-delete input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--black);
    border-radius: 20px;
    font-size: 14px;
    background-color: var(--white);
    color: var(--black);
    margin-top: 8px;
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
