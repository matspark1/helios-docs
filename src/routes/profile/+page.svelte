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
</script>

<svelte:head>
  <title>Profile | Helios Docs</title>
  <meta name="description" content="Profile Helios Docs" />
</svelte:head>

<div class="app-container">
  <Header />
  <div class="wrapper">
    <div class="profile-wrapper">
      <div class="profile-user-info">
        <img src={profilePic} alt="pfp" class="profile-pfp" />
        <p class="profile-name">{currentUser ? currentUser.displayName : ""}</p>
        <p class="profile-email">{currentUser ? currentUser.email : ""}</p>
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
