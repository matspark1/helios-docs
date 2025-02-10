<script>
  import { onMount } from "svelte";
  import Header from "$lib/components/Header.svelte";
  import { signOut, getAuth, updateProfile, updateEmail } from "firebase/auth";
  import { doc, updateDoc, getFirestore } from "firebase/firestore";
  import { user } from "../../stores/authStore";
  import { fetchUserProfilePic } from "$lib/util/getProfilePicture";
  import pfp from "$lib/images/pfp.png";
  import { monthNames, getUserData } from "$lib/util/getUserDate";
  import toast from "svelte-french-toast";

  let currentUser;
  let profilePic = pfp;
  let formattedDate = "";
  let isEditing = false;

  // Editable fields
  let firstName = "";
  let lastName = "";
  let email = "";

  // Subscribe to your custom user store for display purposes only.
  user.subscribe((value) => {
    currentUser = value;
    if (currentUser) {
      const names = currentUser.displayName
        ? currentUser.displayName.split(" ")
        : [];
      firstName = names[0] || "";
      lastName = names[1] || "";
      email = currentUser.email || "";
    }
  });

  const auth = getAuth();
  const firestore = getFirestore();

  const signUserOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const enableEdit = () => {
    if (currentUser) {
      const names = currentUser.displayName
        ? currentUser.displayName.split(" ")
        : [];
      firstName = names[0] || "";
      lastName = names[1] || "";
      email = currentUser.email || "";
    }
    isEditing = true;
  };

  const resetFields = () => {
    if (currentUser) {
      const names = currentUser.displayName
        ? currentUser.displayName.split(" ")
        : [];
      firstName = names[0] || "";
      lastName = names[1] || "";
      email = currentUser.email || "";
    }
  };

  const updateUserProfile = async () => {
    // Use the actual Firebase Auth user object
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    try {
      const newDisplayName = `${firstName} ${lastName}`;

      // Update the display name in Firebase Auth
      await updateProfile(firebaseUser, { displayName: newDisplayName });

      // Update the email if it has changed
      if (email !== firebaseUser.email) {
        await updateEmail(firebaseUser, email);
      }

      // Update Firestore document
      const userDocRef = doc(firestore, "users", firebaseUser.uid);
      await updateDoc(userDocRef, {
        name: newDisplayName,
        email: email,
      });

      // Refresh the user data from Firebase
      await firebaseUser.reload();
      currentUser = auth.currentUser;
      // Update the store if necessary
      user.set(currentUser);

      console.log("User profile updated successfully");
      toast.success("Profile updated successfully");
      isEditing = false;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    }
  };

  $: if (currentUser?.uid) {
    fetchUserProfilePic(currentUser.uid).then((url) => {
      profilePic = url;
    });
    getUserData(currentUser.uid).then((data) => {
      const createdAt = new Date(data);
      const month = createdAt.getUTCMonth();
      const day = createdAt.getUTCDate();
      const year = createdAt.getUTCFullYear();
      formattedDate = `${monthNames[month]} ${day} ${year}`;
    });
  }

  onMount(() => {
    const themeSelect = document.querySelector("#theme-select");

    const applySelectedTheme = () => {
      const selectedTheme = themeSelect.value;
      localStorage.setItem("user-theme", selectedTheme);

      if (selectedTheme === "dark") {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
      } else if (selectedTheme === "light") {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
      } else {
        applySystemTheme();
      }
    };

    const applySystemTheme = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.body.classList.toggle("dark-theme", prefersDark);
      document.body.classList.toggle("light-theme", !prefersDark);
    };

    const savedTheme = localStorage.getItem("user-theme") || "system";
    themeSelect.value = savedTheme;
    applySelectedTheme();

    themeSelect.addEventListener("change", applySelectedTheme);

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (themeSelect.value === "system") {
          applySystemTheme();
        }
      });
  });
</script>

<svelte:head>
  <title>Profile | Helios Docs</title>
  <meta name="description" content="Profile Helios Docs" />
</svelte:head>

<div class="app-container">
  <Header />
  <div class="bg-wrapper">
    <div class="content-wrapper">
      <div class="profile-container">
        <div class="profile-wrapper">
          <i class="fa-solid fa-xmark close"></i>
          <div class="profile-user-info">
            <img src={profilePic} alt="pfp" class="profile-pfp" />
            {#if isEditing}
              <div class="profile-info">
                <p>First Name</p>
                <input type="text" bind:value={firstName} />
              </div>
              <div class="profile-info">
                <p>Last Name</p>
                <input type="text" bind:value={lastName} />
              </div>
              <div class="profile-info">
                <p>Email</p>
                <input type="email" bind:value={email} />
              </div>
              <div class="profile-info">
                <p>Member Since</p>
                <p>{formattedDate}</p>
              </div>
            {:else}
              <div class="profile-info">
                <p>Name</p>
                <p>{currentUser ? currentUser.displayName : ""}</p>
              </div>
              <div class="profile-info">
                <p>Email</p>
                <p>{currentUser ? currentUser.email : ""}</p>
              </div>
              <div class="profile-info">
                <p>Member Since</p>
                <p>{formattedDate}</p>
              </div>
            {/if}
          </div>
          <div class="theme">
            <p>Theme</p>
            <select name="theme" id="theme-select">
              <option value="system">System</option>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
          {#if isEditing}
            <button on:click={updateUserProfile} class="pf-savebtn">
              <i class="fa-solid fa-floppy-disk"></i> Save
            </button>
            <button
              class="pf-cancelbtn"
              on:click={() => {
                resetFields();
                isEditing = false;
              }}
            >
              <i class="fa-solid fa-ban"></i> Cancel
            </button>
          {:else}
            <button on:click={enableEdit} class="pf-editbtn">
              <i class="fa-solid fa-pen-to-square"></i>
              <p>Edit Profile</p>
            </button>
            <div class="signout-wrap">
              <button class="signoutbtn" on:click={signUserOut}>
                <i class="fa-solid fa-right-from-bracket"></i>
                <p>Sign Out</p>
              </button>
            </div>
          {/if}
        </div>
        <div class="pf-close close"></div>
      </div>
    </div>
  </div>
</div>
