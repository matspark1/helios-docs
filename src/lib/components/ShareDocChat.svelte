<script>
  import { onMount } from "svelte";
  import { auth } from "$lib/FirebaseConfig";
  import {
    getDocument,
    shareDocument,
    removeSharedUser,
  } from "$lib/services/documentService";
  import { doc, getDoc } from "firebase/firestore";
  import { db } from "$lib/FirebaseConfig";

  export let documentId;

  let showModal = false;
  let isLoading = false;
  let userEmail = "";
  let errorMessage = "";
  let successMessage = "";
  let document = null;
  let sharedUsers = [];
  let ownerUser = null;
  let isOwner = false;

  async function loadDocumentData() {
    isLoading = true;
    errorMessage = "";
    sharedUsers = [];

    try {
      document = await getDocument(documentId);
      console.log("Document data:", document);

      if (document) {
        isOwner = document.ownerId === auth.currentUser?.uid;

        try {
          const ownerDoc = await getDoc(doc(db, "users", document.ownerId));
          if (ownerDoc.exists()) {
            const ownerData = ownerDoc.data();
            ownerUser = {
              userId: document.ownerId,
              email: ownerData.email,
              name: ownerData.name || ownerData.email,
              photoURL: ownerData.photoURL || "/default-avatar.png",
              role: "owner",
            };
          }
        } catch (error) {
          console.error("Error fetching owner data:", error);
        }

        if (document.sharedWith && Array.isArray(document.sharedWith)) {
          console.log("Shared with array:", document.sharedWith);

          const tempSharedUsers = [];

          for (const share of document.sharedWith) {
            try {
              console.log("Processing share:", share);
              const userDoc = await getDoc(doc(db, "users", share.userId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                tempSharedUsers.push({
                  userId: share.userId,
                  email: userData.email,
                  name: userData.name || userData.email,
                  photoURL: userData.photoURL || "/default-avatar.png",
                  role: share.role,
                });
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
            }
          }

          sharedUsers = tempSharedUsers;
          console.log("Final shared users array:", sharedUsers);
        }
      }
    } catch (error) {
      console.error("Error loading document:", error);
      errorMessage = "Failed to load document information.";
    } finally {
      isLoading = false;
    }
  }

  function openShareModal() {
    loadDocumentData();
    showModal = true;
  }

  function closeModal() {
    showModal = false;
    userEmail = "";
    errorMessage = "";
    successMessage = "";
  }

  async function handleShareDocument() {
    if (!userEmail.trim()) {
      errorMessage = "Please enter a valid email address.";
      return;
    }

    isLoading = true;
    errorMessage = "";
    successMessage = "";

    try {
      await shareDocument(documentId, userEmail);
      userEmail = "";
      successMessage = "Document shared successfully!";

      await loadDocumentData();
    } catch (error) {
      console.error("Error sharing document:", error);
      errorMessage = error.message || "Failed to share document.";
    } finally {
      isLoading = false;
    }
  }

  async function handleRemoveUser(userId) {
    if (!confirm("Are you sure you want to remove this user?")) return;

    isLoading = true;
    errorMessage = "";

    try {
      await removeSharedUser(documentId, userId);
      successMessage = "User removed successfully!";

      await loadDocumentData();
    } catch (error) {
      console.error("Error removing user:", error);
      errorMessage = error.message || "Failed to remove user.";
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
  class="share-button chatFileBtn"
  on:click={openShareModal}
  aria-label="Share Document"
>
  <i class="fa-solid fa-share"></i>
</button>

{#if showModal}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h2>Share "{document?.title || "Document"}"</h2>
        <button class="close-button" on:click={closeModal}>
          <i class="fa-solid fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        {#if errorMessage}
          <div class="error-message">
            <i class="fa-solid fa-exclamation-circle"></i>
            {errorMessage}
          </div>
        {/if}

        {#if successMessage}
          <div class="success-message">
            <i class="fa-solid fa-check-circle"></i>
            {successMessage}
          </div>
        {/if}

        <form on:submit|preventDefault={handleShareDocument}>
          <div class="share-input-group">
            <input
              type="email"
              placeholder="Enter email address"
              bind:value={userEmail}
              disabled={isLoading}
            />
            <button
              type="submit"
              class="share-submit-button"
              disabled={isLoading || !userEmail.trim()}
            >
              <i class="fi fi-sr-paper-plane-top"></i>
            </button>
          </div>
        </form>

        <div class="shared-users-section">
          <h3>People with access</h3>

          {#if isLoading && !ownerUser && !sharedUsers.length}
            <div class="loading-indicator">Loading users...</div>
          {:else}
            <ul class="shared-users-list">
              {#if ownerUser}
                <li class="shared-user-item">
                  <div class="user-info">
                    <img
                      src={ownerUser.photoURL}
                      alt={ownerUser.name}
                      class="user-avatar"
                    />
                    <div class="user-details">
                      <span class="user-name">{ownerUser.name}</span>
                      <span class="user-email">{ownerUser.email}</span>
                    </div>
                    <span class="user-role owner">{ownerUser.role}</span>
                  </div>
                </li>
              {/if}

              {#each sharedUsers as user (user.userId)}
                <li class="shared-user-item">
                  <div class="user-info">
                    <img
                      src={user.photoURL}
                      alt={user.name}
                      class="user-avatar"
                    />
                    <div class="user-details">
                      <span class="user-name">{user.name}</span>
                      <span class="user-email">{user.email}</span>
                    </div>
                    <span class="user-role">{user.role || "Editor"}</span>
                  </div>
                  {#if isOwner}
                    <button
                      class="remove-user-button"
                      on:click={() => handleRemoveUser(user.userId)}
                      disabled={isLoading}
                    >
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  {/if}
                </li>
              {/each}

              {#if !ownerUser && sharedUsers.length === 0}
                <div class="no-shared-users">
                  No users have access to this document yet.
                </div>
              {/if}
            </ul>
          {/if}
        </div>
      </div>

      <div class="modal-footer">
        <button class="cancel-button" on:click={closeModal}> Done </button>
      </div>
    </div>
  </div>
{/if}
