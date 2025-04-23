<script>
  import pfp from "$lib/images/pfp.png";
  import { user } from "../../stores/authStore";
  import {
    getFirestore,
    doc,
    getDoc,
    deleteDoc,
    updateDoc,
    serverTimestamp,
  } from "firebase/firestore";
  import { goto } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";
  import toast from "svelte-5-french-toast";
  import { clickOutside } from "$lib/util/clickOutside";

  let showOptions = false;
  let showRenameModal = false;
  let showDeleteModal = false;
  let docOptionsBtn;
  let docOptions;
  let menuPosition = "right";
  let newTitle = "";
  let isLoading = false;
  let confirmText = "";

  let ownerUID = false;

  function positionMenu() {
    if (!docOptionsBtn) return;

    const rect = docOptionsBtn.getBoundingClientRect();

    if (rect.right > window.innerWidth - 200) {
      menuPosition = "left";
    } else {
      menuPosition = "right";
    }
  }

  function toggleOptions(event) {
    event.stopPropagation();
    showOptions = !showOptions;
  }

  function closeOptions() {
    showOptions = false;
  }

  function handleClickOutside(event) {
    if (
      showOptions &&
      docOptionsBtn &&
      !docOptionsBtn.contains(event.target) &&
      docOptions &&
      !docOptions.contains(event.target)
    ) {
      showOptions = false;
    }
  }

  export let document = {
    id: "",
    title: "Untitled Document",
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: "",
  };

  let currentUser;
  let ownerProfilePic = pfp;
  let formattedDate = "";
  let ownerName = "Unknown User";

  $: user.subscribe((value) => {
    currentUser = value;
  });

  async function fetchOwnerProfile(ownerId) {
    if (!ownerId) return;

    try {
      const db = getFirestore();
      const userRef = doc(db, "users", ownerId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        ownerProfilePic = userData.photoURL || pfp;

        ownerUID = userData.uid || false;
        ownerName = userData.name || "Unknown User";
      } else {
        ownerProfilePic = pfp;
      }
    } catch (error) {
      console.error("Error fetching owner profile:", error);
      ownerProfilePic = pfp;
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return "Just now";

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const options = { year: "numeric", month: "short", day: "numeric" };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Unknown date";
    }
  }

  function openDocument() {
    if (document && document.id) {
      goto(`/docs/${document.id}`);
    }
  }

  // DELETE Document functionality - similar to DeleteDocument.svelte
  function openDeleteModal(e) {
    e.stopPropagation();
    showDeleteModal = true;
    showOptions = false;
    confirmText = "";
  }

  function closeDeleteModal() {
    showDeleteModal = false;
    confirmText = "";
  }

  async function handleDeleteDocument() {
    if (confirmText !== (document?.title || "Untitled Document")) {
      return;
    }

    isLoading = true;

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "documents", document.id));
      toast.success("Document deleted successfully");
      closeDeleteModal();
      window.location.reload();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document. Please try again.");
    } finally {
      isLoading = false;
    }
  }

  // RENAME Document functionality
  function openRenameModal(e) {
    e.stopPropagation();
    newTitle = document.title || "Untitled Document";
    showRenameModal = true;
    showOptions = false;
  }

  function closeRenameModal() {
    showRenameModal = false;
    newTitle = "";
  }

  async function handleRenameDocument() {
    if (!newTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    isLoading = true;

    try {
      const db = getFirestore();
      const docRef = doc(db, "documents", document.id);

      await updateDoc(docRef, {
        title: newTitle,
        updatedAt: serverTimestamp(),
      });

      document.title = newTitle;
      toast.success("Document renamed successfully");
      closeRenameModal();
    } catch (error) {
      console.error("Error renaming document:", error);
      toast.error("Failed to rename document");
    } finally {
      isLoading = false;
    }
  }

  onMount(() => {
    if (document.createdAt) {
      formattedDate = formatDate(document.createdAt);
    }

    if (document.ownerId) {
      fetchOwnerProfile(document.ownerId);
    }

    window.addEventListener("click", handleClickOutside);

    window.addEventListener("resize", positionMenu);
    positionMenu();
  });

  onDestroy(() => {
    window.removeEventListener("click", handleClickOutside);
    window.removeEventListener("resize", positionMenu);
  });
</script>

<div class="doc-preview-box">
  <div class="doc-info">
    <button
      class="doc-title"
      on:click={openDocument}
      aria-label="Open Doc Button"
      title={document.title || "Untitled Document"}
    >
      {document.title || "Untitled Document"}
    </button>

    <div class="doc-user-info">
      <img
        src={ownerProfilePic}
        alt="Owner"
        data-tooltip={ownerName}
        data-position="bottom"
      />
      <p>Created On</p>
      <i class="fa-solid fa-circle"></i>
      <p>{formattedDate}</p>
    </div>
  </div>
  {#if ownerUID === currentUser?.uid}
    <div class="doc-preview-btn-wrapper">
      <button
        class="doc-preview-btn"
        aria-label="doc-preview-btn"
        on:click={toggleOptions}
        bind:this={docOptionsBtn}
      >
        <i class="fa-solid fa-ellipsis-vertical"></i>
      </button>
    </div>
  {/if}
  {#if showOptions}
    {#if ownerUID === currentUser?.uid}
      <div
        class="doc-preview-options {menuPosition === 'left'
          ? 'left-pos'
          : 'right-pos'}"
        bind:this={docOptions}
        on:click|stopPropagation
      >
        <button
          class="doc-preview-rename"
          aria-label="doc-preview-rename"
          on:click={openRenameModal}
        >
          <i class="fa-solid fa-pen-to-square"></i> Rename
        </button>
        <button
          class="doc-preview-delete"
          on:click={openDeleteModal}
          aria-label="doc-preview-delete"
        >
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      </div>
    {/if}
  {/if}
</div>

<!-- Rename Modal -->
{#if showRenameModal}
  <div class="modal-overlay" on:click={closeRenameModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Rename Document</h2>
        <button class="close-button" on:click={closeRenameModal}>
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="rename-form">
          <label for="document-title">Document Title</label>
          <input
            type="text"
            id="document-title"
            placeholder="Enter document title"
            bind:value={newTitle}
            disabled={isLoading}
          />
        </div>
      </div>

      <div class="modal-footer">
        <button
          class="cancel-button"
          on:click={closeRenameModal}
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          class="save-button"
          on:click={handleRenameDocument}
          disabled={isLoading || !newTitle.trim()}
        >
          {#if isLoading}
            Saving...
          {:else}
            Save
          {/if}
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Modal -->
{#if showDeleteModal}
  <div class="modal-overlay" on:click={closeDeleteModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Delete Document</h2>
        <button class="close-button" on:click={closeDeleteModal}>
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
          on:click={closeDeleteModal}
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
  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: var(--white);
    border-radius: 8px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid var(--light-black);
  }

  .modal-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: var(--grey);
  }

  .modal-body {
    padding: 16px;
  }

  .rename-form {
    margin-bottom: 16px;
  }

  .rename-form label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .rename-form input,
  .confirm-delete input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--light-grey);
    border-radius: 20px;
    font-size: 14px;
    box-sizing: border-box;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    padding: 16px;
    border-top: 1px solid var(--light-black);
  }

  .cancel-button {
    background-color: var(--light-black);
    color: var(--black);
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
  }

  .save-button,
  .delete-button {
    background-color: var(--primary);
    color: var(--btn-white-white);
    border: none;
    border-radius: 4px;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    font-weight: 600;
  }

  .save-button:disabled,
  .cancel-button:disabled,
  .delete-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

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

  #document-title {
    font-family: "Readex Pro";
  }
  .confirm-delete input {
    font-family: "Readex Pro";
  }
</style>
