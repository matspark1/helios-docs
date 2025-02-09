<script>
  import { createEventDispatcher, onMount } from "svelte";
  import { signOut, getAuth, updateProfile, updateEmail } from "firebase/auth";
  import { doc, updateDoc, getFirestore } from "firebase/firestore";
  import { user } from "../../stores/authStore";
  import { fetchUserProfilePic } from "$lib/util/getProfilePicture";
  import pfp from "$lib/images/pfp.png";
  import { monthNames, getUserData } from "$lib/util/getUserDate";
  import toast from "svelte-french-toast";

  const dispatch = createEventDispatcher();

  let currentUser;
  let profilePic = pfp;
  let formattedDate = "";
  let isEditing = false;
  let firstName = "";
  let lastName = "";
  let email = "";
  let avatarBgColor = "#ffffff";

  function generateInitialsAvatar(name, bgColor = "random") {
    bgColor = bgColor.startsWith("#") ? bgColor.slice(1) : bgColor;
    const initials = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
    return `https://ui-avatars.com/api/?name=${initials}&background=${bgColor}&color=101010&size=300`;
  }

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
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    try {
      // Define newDisplayName first
      const newDisplayName = `${firstName} ${lastName}`;

      // Now generate the profile picture URL using the newDisplayName
      const newProfilePicUrl = generateInitialsAvatar(
        newDisplayName,
        avatarBgColor
      );

      await updateProfile(firebaseUser, {
        displayName: newDisplayName,
        photoURL: newProfilePicUrl,
      });

      if (email !== firebaseUser.email) {
        await updateEmail(firebaseUser, email);
      }

      const userDocRef = doc(firestore, "users", firebaseUser.uid);
      await updateDoc(userDocRef, {
        name: newDisplayName,
        email: email,
        photoURL: newProfilePicUrl,
      });

      await firebaseUser.reload();
      currentUser = auth.currentUser;
      user.set(currentUser);

      profilePic = newProfilePicUrl;

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
      formattedDate = `${monthNames[createdAt.getUTCMonth()]} ${createdAt.getUTCDate()} ${createdAt.getUTCFullYear()}`;
    });
  }

  onMount(() => {
    const closeBG = document.querySelector(".close");
    const closeBtn = document.querySelector(".close-btn");
    const body = document.body;
    closeBG.addEventListener("click", () => {
      body.classList.remove("mobile-overflow");
    });

    closeBtn.addEventListener("click", () => {
      body.classList.remove("mobile-overflow");
    });

    const themeSelect = document.querySelector("#theme-select");

    const applySelectedTheme = () => {
      const selectedTheme = themeSelect.value;
      localStorage.setItem("user-theme", selectedTheme);

      document.body.classList.toggle("dark-theme", selectedTheme === "dark");
      document.body.classList.toggle("light-theme", selectedTheme === "light");

      if (selectedTheme === "system") applySystemTheme();
    };

    const applySystemTheme = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.body.classList.toggle("dark-theme", prefersDark);
      document.body.classList.toggle("light-theme", !prefersDark);
    };

    themeSelect.value = localStorage.getItem("user-theme") || "system";
    applySelectedTheme();

    themeSelect.addEventListener("change", applySelectedTheme);
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        if (themeSelect.value === "system") applySystemTheme();
      });
  });

  const closeProfileDiv = () => {
    dispatch("close");
  };
</script>

<div class="profile-container">
  <div class="profile-wrapper">
    <i class="fa-solid fa-xmark close-btn" on:click={closeProfileDiv}></i>

    <div class="profile-user-info">
      <img src={profilePic} alt="Profile Picture" class="profile-pfp" />
      {#if isEditing}
        <div class="profile-info">
          <p>Avatar Color</p>
          <input class="pf-color" type="color" bind:value={avatarBgColor} />
        </div>
        <div class="profile-info">
          <p>First Name</p>
          <input type="text" bind:value={firstName} />
        </div>
        <div class="profile-info">
          <p>Last Name</p>
          <input type="text" bind:value={lastName} />
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
  <div class="pf-close close" on:click={closeProfileDiv}></div>
</div>
