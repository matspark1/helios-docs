<script>
  import { onMount } from "svelte";
  import { getDocument } from "$lib/services/documentService";
  import { db } from "$lib/FirebaseConfig";
  import { doc, getDoc } from "firebase/firestore";
  import { auth } from "$lib/FirebaseConfig";

  export let documentId;

  let showModal = false;
  let isLoading = false;
  let document = null;
  let ownerUser = null;
  let createdDate = null;
  let lastModifiedDate = null;
  let wordCount = 0;
  let characterCount = 0;

  async function loadDocumentData() {
    isLoading = true;

    try {
      document = await getDocument(documentId);

      if (document) {
        // Format dates
        if (document.createdAt) {
          const createdAtDate = document.createdAt.toDate
            ? document.createdAt.toDate()
            : new Date(document.createdAt);
          createdDate =
            createdAtDate.toLocaleDateString() +
            " " +
            createdAtDate.toLocaleTimeString();
        }

        if (document.lastModified) {
          const modifiedDate = document.lastModified.toDate
            ? document.lastModified.toDate()
            : new Date(document.lastModified);
          lastModifiedDate =
            modifiedDate.toLocaleDateString() +
            " " +
            modifiedDate.toLocaleTimeString();
        }

        // Get owner information
        try {
          const ownerDoc = await getDoc(doc(db, "users", document.ownerId));
          if (ownerDoc.exists()) {
            const ownerData = ownerDoc.data();
            ownerUser = {
              userId: document.ownerId,
              email: ownerData.email,
              name: ownerData.name || ownerData.email,
              photoURL: ownerData.photoURL || "/default-avatar.png",
            };
          }
        } catch (error) {
          console.error("Error fetching owner data:", error);
        }

        const editorElement = window.document.querySelector(
          ".docseditor-container .editor"
        );
        if (editorElement) {
          const text = editorElement.textContent || "";
          characterCount = text.length;
          wordCount = text
            .split(/\s+/)
            .filter((word) => word.length > 0).length;
        }
      }
    } catch (error) {
      console.error("Error loading document:", error);
    } finally {
      isLoading = false;
    }
  }

  function openDetailsModal() {
    loadDocumentData();
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  onMount(() => {
    if (documentId) {
      loadDocumentData();
    }
  });
</script>

<button
  class="file-btn-rename fileBtn"
  on:click={openDetailsModal}
  aria-label="Document Details"
>
  <i class="fi fi-br-interrogation"></i>
</button>

{#if showModal}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Document Details</h2>
        <button class="close-button" on:click={closeModal}>
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        {#if isLoading}
          <div class="loading-indicator">Loading document details...</div>
        {:else if document}
          <div class="document-details">
            <div class="detail-item">
              <span class="detail-label">Title:</span>
              <span class="detail-value"
                >{document.title || "Untitled Document"}</span
              >
            </div>

            {#if ownerUser}
              <div class="detail-item">
                <span class="detail-label">Owner:</span>
                <div class="user-info">
                  <img
                    src={ownerUser.photoURL}
                    alt={ownerUser.name}
                    class="user-avatar"
                  />
                  <span class="detail-value"
                    >{ownerUser.name} ({ownerUser.email})</span
                  >
                </div>
              </div>
            {/if}

            {#if createdDate}
              <div class="detail-item">
                <span class="detail-label">Created:</span>
                <span class="detail-value">{createdDate}</span>
              </div>
            {/if}

            {#if lastModifiedDate}
              <div class="detail-item">
                <span class="detail-label">Last Modified:</span>
                <span class="detail-value">{lastModifiedDate}</span>
              </div>
            {/if}

            {#if document.sharedWith && document.sharedWith.length > 0}
              <div class="detail-item">
                <span class="detail-label">Shared with:</span>
                <span class="detail-value"
                  >{document.sharedWith.length} users</span
                >
              </div>
            {/if}
          </div>
        {:else}
          <div class="error-message">
            <i class="fa-solid fa-exclamation-circle"></i>
            Document not found or you don't have permission to view it.
          </div>
        {/if}
      </div>

      <div class="modal-footer">
        <button class="cancel-button" on:click={closeModal}>Close</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .document-details {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .detail-item {
    display: flex;
    align-items: center;
  }

  .detail-label {
    font-weight: 600;
    min-width: 120px;
    color: var(--black);
  }

  .detail-value {
    color: var(--grey);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .user-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    object-fit: cover;
  }

  .loading-indicator {
    padding: 20px;
    text-align: center;
    color: var(--grey);
  }

  .error-message {
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--light-black);
    color: var(--primary);
  }
</style>
