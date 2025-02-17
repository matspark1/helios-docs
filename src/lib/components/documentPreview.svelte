<script>
  import pfp from "$lib/images/pfp.png";
  import { user } from "../../stores/authStore";
  import { getFirestore, doc, getDoc } from "firebase/firestore";
  import { onMount } from "svelte";

  let currentUser;
  let profilePic = pfp;

  $: user.subscribe((value) => {
    currentUser = value;
    if (currentUser?.uid) fetchUserProfile(currentUser.uid);
  });

  async function fetchUserProfile(uid) {
    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    profilePic =
      userSnap.exists() && userSnap.data().photoURL
        ? userSnap.data().photoURL
        : pfp;
  }
  onMount(() => {
    const docTitle = document.querySelector(".docTitle");
    const docOptionsBtn = document.querySelector(".doc-preview-btn-wrapper");
    const docOptions = document.querySelector(".doc-preview-options");

    docOptionsBtn.addEventListener("click", () => {
      event.stopPropagation();
      docOptions.classList.toggle("open");
      console.log("HEE");
    });

    document.addEventListener("click", (event) => {
      if (
        !docOptions.contains(event.target) &&
        !docOptionsBtn.contains(event.target)
      ) {
        docOptions.classList.remove("open");
      }
    });
  });
</script>

<div class="doc-preview-box">
  <div class="doc-info">
    <h1 class="doc-title">
      Doc Title 1 Doc Title 1 Doc Title 1 Doc Title 1 Doc Title 1 Doc Title 1
      Doc Title 1 Doc Title 1
    </h1>
    <div class="doc-user-info">
      <img src={profilePic} alt="pfp" />
      <p>Created On</p>
      <i class="fa-solid fa-circle"></i>
      <p>Dec, 16, 2001</p>
    </div>
  </div>
  <div class="doc-preview-btn-wrapper">
    <button class="doc-preview-btn" aria-label="doc-preview-btn">
      <i class="fa-solid fa-ellipsis-vertical"></i>
    </button>
  </div>
  <div class="doc-preview-options">
    <button class="doc-preview-dwnld" aria-label="doc-preview-dwnld"
      ><i class="fa-regular fa-circle-down"></i> Download</button
    >
    <button class="doc-preview-rename" aria-label="doc-preview-rename"
      ><i class="fa-solid fa-pen-to-square"></i> Rename</button
    >
    <button class="doc-preview-delete" aria-label="doc-preview-delete"
      ><i class="fa-solid fa-trash"></i> Delete</button
    >
  </div>
</div>
