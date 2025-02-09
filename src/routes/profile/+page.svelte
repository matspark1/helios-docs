<script>
  import { onMount } from "svelte";
  import Header from "$lib/components/Header.svelte";
  import { signOut, getAuth } from "firebase/auth";
  import toast from "svelte-french-toast";
  import { user } from "../../stores/authStore";
  import { auth } from "$lib/FirebaseConfig";
  import { getFirestore, doc, getDoc } from "firebase/firestore";
  import { fetchUserProfilePic } from "$lib/util/getProfilePicture";
  import pfp from "$lib/images/pfp.png";

  let currentUser;
  let profilePic = pfp;

  const unsubscribe = user.subscribe((value) => {
    currentUser = value;
  });

  const authGet = getAuth();

  const signUserOut = async () => {
    try {
      await signOut(authGet);
      console.log("User signed out");
    } catch (error) {
      console.log("Error signing out: ", error);
    }
  };

  $: if (currentUser?.uid) {
    fetchUserProfilePic(currentUser.uid).then((url) => {
      profilePic = url;
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
      } else if (selectedTheme === "system") {
        applySystemTheme();
      }
    };

    const applySystemTheme = () => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (prefersDark) {
        document.body.classList.add("dark-theme");
        document.body.classList.remove("light-theme");
      } else {
        document.body.classList.add("light-theme");
        document.body.classList.remove("dark-theme");
      }
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
      <div class="profile-wrapper">
        <div class="profile-user-info">
          <img src={profilePic} alt="pfp" class="profile-pfp" />
          <p class="profile-name">
            {currentUser ? currentUser.displayName : ""}
          </p>
          <p class="profile-email">{currentUser ? currentUser.email : ""}</p>
        </div>
        <div class="theme">
          <p>Theme</p>
          <select name="theme" id="theme-select">
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>

        <div class="signout-wrap">
          <button class="signoutbtn" on:click={signUserOut}>
            <i class="fa-solid fa-right-from-bracket"></i>
            <p>Sign Out</p>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
