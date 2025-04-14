<script>
  import pfp from "$lib/images/pfp.png";
  import { user } from "../../stores/authStore";
  import { getFirestore, doc, getDoc, deleteDoc } from "firebase/firestore";
  import { goto } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";
  import { clickOutside } from "$lib/util/clickOutside";

  let showOptions = false;
  let docOptionsBtn;
  let docOptions;

  // Declare ownerUID at the component level
  let ownerUID = false;

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

  async function deleteDocument(e) {
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, "documents", document.id));
      window.location.reload();
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("Failed to delete document. Please try again.");
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
  });

  onDestroy(() => {
    window.removeEventListener("click", handleClickOutside);
  });
</script>

<div class="doc-preview-box">
  <div class="doc-info">
    <button
      class="doc-title"
      on:click={openDocument}
      aria-label="Open Doc Button"
    >
      {document.title || "Untitled Document"}
    </button>

    <div class="doc-user-info">
      <img
        src={ownerProfilePic}
        alt="Owner"
        data-tooltip={document.ownerName}
        data-position="bottom"
      />
      <p>Created On</p>
      <i class="fa-solid fa-circle"></i>
      <p>{formattedDate}</p>
    </div>
  </div>
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
  {#if showOptions}
    <div
      class="doc-preview-options"
      bind:this={docOptions}
      on:click|stopPropagation
    >
      <button class="doc-preview-dwnld" aria-label="doc-preview-dwnld">
        <i class="fa-regular fa-circle-down"></i> Download
      </button>
      {#if ownerUID === currentUser.uid}
        <button class="doc-preview-rename" aria-label="doc-preview-rename">
          <i class="fa-solid fa-pen-to-square"></i> Rename
        </button>
        <button
          class="doc-preview-delete"
          on:click|stopPropagation={deleteDocument}
          aria-label="doc-preview-delete"
        >
          <i class="fa-solid fa-trash"></i> Delete
        </button>
      {/if}
    </div>
  {/if}
</div>
